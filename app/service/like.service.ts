import { prismaClient } from "../database/db";
import type { Prisma } from "../generated/prisma/client";
import {
  ErrorResponseMessage,
  ResponseError,
} from "../response/error.response";
import { ProductResponse } from "../response/product.response";
import {
  LikeValidation,
  type LikeValidationQuery,
} from "../validation/like.validation";
import type { ProductQueryResponse } from "../validation/product.validation";
import Validation from "../validation/validation";

const database = prismaClient.userLikedProduct;
const validation: typeof LikeValidation = LikeValidation;

export class LikeService {
  static async CHECK(productId?: string, userId?: string): Promise<boolean> {
    if (!productId || !userId)
      throw new ResponseError(ErrorResponseMessage.FORBIDDEN());
    const liked = await database.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return !!liked;
  }

  static async COUNT_ALL(productId?: string): Promise<number> {
    return database.count({ where: { productId } });
  }

  static async QUERY(
    userId: string,
    query: LikeValidationQuery
  ): Promise<ProductQueryResponse> {
    const validatedQuery = Validation.validate(validation.QUERY, query);
    const {
      q,
      name,
      minStock,
      maxStock,
      minPrice,
      maxPrice,
      cursor,
      take,
      sort,
      order,
      category,
    } = validatedQuery;

    const where: Prisma.ProductWhereInput = {
      ...(name && {
        name: { contains: name, mode: "insensitive" },
      }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(category && {
        category: {
          slug: category,
        },
      }),
      ...((minStock !== undefined || maxStock !== undefined) && {
        stock: {
          ...(minStock !== undefined && { gte: minStock }),
          ...(maxStock !== undefined && { lte: maxStock }),
        },
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
    };

    const [products, totalFiltered, totalAll] = await Promise.all([
      prismaClient.product.findMany({
        where: {
          likedByUsers: {
            some: {
              userId,
            },
          },
          ...where,
        },
        orderBy: {
          [sort]: order,
        },
        take: take + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        select: ProductResponse.QUERY,
      }),
      prismaClient.product.count({
        where: { likedByUsers: { some: { userId } }, ...where },
      }),
      prismaClient.product.count({
        where: { likedByUsers: { some: { userId } } },
      }),
    ]);
    const hasNext = products.length > take;
    const items = hasNext ? products.slice(0, take) : products;

    return {
      items,
      pagination: {
        take,
        hasNext,
        nextCursor: hasNext ? items[items.length - 1]?.id : null,
        totalFiltered,
        totalAll,
      },
    };
  }

  static async TOGGLE(
    userId: string,
    productId?: string
  ): Promise<{ productId: string }> {
    if (!productId || !userId)
      throw new ResponseError(ErrorResponseMessage.FORBIDDEN());
    const item = await database.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (item) {
      return database.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        select: {
          productId: true,
        },
      });
    } else {
      return database.create({
        data: {
          userId,
          productId,
        },
        select: {
          productId: true,
        },
      });
    }
  }
}

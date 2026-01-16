import { prismaClient } from "../database/db.ts";
import {
  ErrorResponseMessage,
  ResponseError,
  type Schema,
} from "../response/error.response.ts";
import {
  ProductValidation,
  type ProductQueryResponse,
  type ProductValidationGet,
  type ProductValidationQuery,
  type ProductHelperValidationStock,
  ProductHelperValidation, type ProductValidationPost
} from "../validation/product.validation.ts";
import Validation from "../validation/validation.ts";
import { ProductResponse } from "../response/product.response.ts";
import type { Prisma, Product } from "../generated/prisma/client.ts";
import slugify from "slugify";

const database = prismaClient.product;
const schema: Schema = "product";
const validation: typeof ProductValidation = ProductValidation;

export class ProductService {
  static async QUERY(
    query: ProductValidationQuery
  ): Promise<ProductQueryResponse> {
    const validatedQuery = Validation.validate(validation.QUERY, query);
    const {
      q,
      name,
      gender,
      published,
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
      ...(gender && { gender }),
      ...(published !== undefined && { published }),
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
    
    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sort]: order,
    }
    if (sort == 'liked') orderBy = {likedByUsers: {_count: order}}
    if (sort == 'bookmarked') orderBy = {bookmarkedByUsers: {_count: order}}
    if (sort == 'reviews') orderBy = {reviews: {_count: order}}
    if (sort == 'rating') orderBy = {averageRating: order}

    const [products, totalFiltered, totalAll] = await Promise.all([
      database.findMany({
        where,
        orderBy: [{...orderBy}, {variants: {_count: 'desc'}}],
        take: take + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        select: ProductResponse.QUERY,
      }),
      database.count({ where }),
      database.count(),
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

  static async GET(by: "id" | "slug", key: string): Promise<Product> {
    const validatedIdentifier: ProductValidationGet = Validation.validate(
      validation.GET,
      { by, key }
    );
    if (validatedIdentifier.by === "id") {
      const checkProduct = await database.findUnique({
        where: { id: validatedIdentifier.key },
        select: ProductResponse.GET,
      });
      if (!checkProduct)
        throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
      return checkProduct;
    } else {
      const checkProduct = await database.findUnique({
        where: { slug: validatedIdentifier.key },
        select: ProductResponse.GET,
      });
      if (!checkProduct)
        throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
      return checkProduct;
    }
  }
  static async POST(body: ProductValidationPost): Promise<{id: string}> {
    const validatedBody: ProductValidationPost = Validation.validate(validation.POST, body);
    const category = await prismaClient.category.findUnique({where: {id: validatedBody.categoryId}, select: {id: true}});
    if (!category) throw new ResponseError(ErrorResponseMessage.NOT_FOUND("category"));
    if (validatedBody.coverId) {
      const media = await prismaClient.media.findUnique({where: {id: validatedBody.coverId}, select: {id: true}});
      if (!media) throw new ResponseError(ErrorResponseMessage.NOT_FOUND("media"))
    }
    const slug = slugify(validatedBody.name, {lower: true, trim: true});
    return database.create({
      data: {
        ...validatedBody,
        slug,
      },
      select: {id: true},
    })
  }
}
export class ProductHelperService {
  static async STOCK(body: ProductHelperValidationStock): Promise<number> {
    const validatedBody: ProductHelperValidationStock = Validation.validate(
      ProductHelperValidation.STOCK,
      body
    );
    const stock = await prismaClient.variant.findFirst({
      where: {
        AND: [
          { productId: validatedBody.productId },
          { colourId: validatedBody.colourId },
          { sizeId: validatedBody.sizeId },
        ],
      },
      select: {
        stock: true,
      },
    });
    if (!stock)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("variant"));
    return stock.stock;
  }
}

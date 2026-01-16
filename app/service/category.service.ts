import { prismaClient } from "../database/db.ts";
import {
  ErrorResponseMessage,
  ResponseError,
  type Schema,
} from "../response/error.response.ts";
import Validation from "../validation/validation.ts";
import type { Category, Prisma } from "../generated/prisma/client.ts";
import {
  CategoryValidation,
  type CategoryQueryResponse,
  type CategoryValidationGet,
  type CategoryValidationQuery,
} from "../validation/category.validation.ts";
import { CategoryResponse } from "../response/category.response.ts";

const database = prismaClient.category;
const schema: Schema = "category";
const validation: typeof CategoryValidation = CategoryValidation;

export class CategoryService {
  static async QUERY(
    query: CategoryValidationQuery
  ): Promise<CategoryQueryResponse> {
    const validatedQuery: CategoryValidationQuery = Validation.validate(
      validation.QUERY,
      query
    );

    const { order, sort, take, cursor, name, published, q } = validatedQuery;

    const where: Prisma.CategoryWhereInput = {
      ...(name && {
        name: { contains: name, mode: "insensitive" },
      }),
      ...(published !== undefined && { published }),
      ...(q && {
        OR: [{ name: { contains: q, mode: "insensitive" } }],
      }),
    };

    const [categories, totalFiltered, totalAll] = await Promise.all([
      database.findMany({
        where,
        orderBy: {
          [sort]: order,
        },
        take: take + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        select: CategoryResponse.QUERY,
      }),
      database.count({ where }),
      database.count(),
    ]);
    const hasNext = categories.length > take;
    const items = hasNext ? categories.slice(0, take) : categories;

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

  static async GET(by: "id" | "slug", key: string): Promise<Category> {
    const validatedIdentifier: CategoryValidationGet = Validation.validate(
      validation.GET,
      { by, key }
    );
    if (validatedIdentifier.by === "id") {
      const checkCategory = await database.findUnique({
        where: { id: validatedIdentifier.key },
        select: CategoryResponse.GET,
      });
      if (!checkCategory)
        throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
      return checkCategory;
    } else {
      const checkCategory = await database.findUnique({
        where: { slug: validatedIdentifier.key },
        select: CategoryResponse.GET,
      });
      if (!checkCategory)
        throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
      return checkCategory;
    }
  }
}

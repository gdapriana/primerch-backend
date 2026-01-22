import { prismaClient } from "../database/db.ts";
import {
  ErrorResponseMessage,
  ResponseError,
  type Schema,
} from "../response/error.response.ts";
import Validation from "../validation/validation.ts";
import type { Category, Media, Prisma } from "../generated/prisma/client.ts";
import {
  CategoryValidation,
  type CategoryQueryResponse,
  type CategoryValidationGet,
  type CategoryValidationQuery, type CategoryAdminValidationPost, CategoryAdminValidation,
  type CategoryAdminValidationPatch
} from "../validation/category.validation.ts";
import { CategoryResponse } from "../response/category.response.ts";
import slugify from "slugify";

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

export class CategoryAdminService {
  static async GET_CATEGORY(categoryId: string): Promise<Category> {
    const category = await database.findUnique({where: {id: categoryId}});
    if (!category) throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
    return category;
  }
  static async GET_COVER(categoryId: string): Promise<Media> {
    const category = await database.findUnique({where: {id: categoryId}, select: {coverId: true}});
    if (!category) throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
    if (!category.coverId) throw new ResponseError(ErrorResponseMessage.NOT_FOUND("media"));
    const media = await prismaClient.media.findUnique({where: {id: category.coverId}});
    if (!media) throw new ResponseError(ErrorResponseMessage.NOT_FOUND("media"));
    return media;
  }
  static async GET_PRODUCTS(): Promise<void> {}
  static async POST_CATEGORIES(body: CategoryAdminValidationPost): Promise<{id: string}> {
    const validatedBody: CategoryAdminValidationPost = Validation.validate(CategoryAdminValidation.POST, body);
    const slug = slugify(validatedBody.name)
    const checkCategory = await database.findUnique({where: {slug}, select: {id: true}});
    if (checkCategory) throw new ResponseError(ErrorResponseMessage.ALREADY_EXISTS(schema));
    if (validatedBody.coverId) {
      const media = await prismaClient.media.findUnique({where: {id: validatedBody.coverId}, select: {id: true}})
      if (!media) throw new ResponseError(ErrorResponseMessage.NOT_FOUND("media"));
    }
    return database.create({
      data: {
        ...validatedBody,
        slug
      },
      select: {
        id: true
      }
    })
    
  }
  static async PATCH_CATEGORIES(categoryId: string, body: CategoryAdminValidationPatch): Promise<{id: string}> {
    const checkCategory = await database.findUnique({where: {id: categoryId}});
    if (!checkCategory) throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
    const validatedBody: CategoryAdminValidationPatch = Validation.validate(CategoryAdminValidation.PATCH, body);

    if (validatedBody.name === checkCategory.name) validatedBody.name = undefined
    let slug = undefined
    if (validatedBody.name && validatedBody.name !== checkCategory.name) {
      slug = slugify(validatedBody.name);
      const checkSlug = await database.findUnique({where: {slug}});
      if (checkSlug) throw new ResponseError(ErrorResponseMessage.ALREADY_EXISTS(schema));
    }
    if (validatedBody.description === checkCategory.description) validatedBody.description = undefined
    if (validatedBody.coverId === checkCategory.coverId) validatedBody.coverId = undefined
    
    return database.update({
      where: {
        id: categoryId
      },
      data: {
        ...validatedBody,
        slug
      },select: {id: true}
    })
  }
  static async DELETE_CATEGORIES(categoryId: string): Promise<{id: string}> {
    const checkCategory = await database.findUnique({where: {id: categoryId}});
    if (!checkCategory) throw new ResponseError(ErrorResponseMessage.NOT_FOUND(schema));
    return database.delete({where: {id: categoryId}, select: {id: true}});
  }
}
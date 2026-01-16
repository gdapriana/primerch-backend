import { z } from "zod";
import { GENDER } from "../generated/prisma/enums";
import type { Product } from "../generated/prisma/client";
import type { PaginationType } from "../type/response.type";

const sortableFields = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "stock",
  "price",
  "liked",
  "bookmarked",
  "reviews",
  "rating"
] as const;

export class ProductValidation {
  static QUERY = z.object({
    q: z.string().trim().min(1, "Search query cannot be empty").optional(),
    name: z.string().optional(),
    gender: z.enum([GENDER.MALE, GENDER.FEMALE, GENDER.UNISEX]).optional(),
    category: z.string().optional(),
    published: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    minStock: z.coerce
      .number()
      .int()
      .min(0, "Min stock must be positive")
      .optional(),
    maxStock: z.coerce
      .number()
      .int()
      .min(0, "Max stock must be positive")
      .optional(),
    minPrice: z.coerce.number().min(0, "Min price must be positive").optional(),
    maxPrice: z.coerce.number().min(0, "Max price must be positive").optional(),
    cursor: z.string().optional(),
    take: z.coerce
      .number()
      .int()
      .min(1, "Take must be a positive integer")
      .default(10),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  });
  static GET = z.object({
    by: z.enum(["id", "slug"]),
    key: z.string().min(1),
  });
  static POST = z.object({
    name: z.string().min(2).max(200),
    description: z.string().min(3).optional().nullable(),
    gender: z.enum([GENDER.UNISEX, GENDER.MALE, GENDER.FEMALE]).default(GENDER.UNISEX),
    price: z.number().default(0),
    published: z.boolean().default(true),
    categoryId: z.string().min(1),
    coverId: z.string().min(1).optional().nullable()
  })
}
export class ProductHelperValidation {
  static STOCK = z.object({
    productId: z.string().min(1),
    colourId: z.string().min(1),
    sizeId: z.string().min(1),
  });
}

export type ProductValidationQuery = z.infer<typeof ProductValidation.QUERY>;
export type ProductValidationGet = z.infer<typeof ProductValidation.GET>;
export type ProductHelperValidationStock = z.infer<
  typeof ProductHelperValidation.STOCK
>;
export type ProductValidationPost = z.infer<typeof ProductValidation.POST>;
export type ProductQueryResponse = {
  items: Product[];
  pagination: PaginationType;
};

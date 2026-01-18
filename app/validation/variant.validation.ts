import { z } from "zod";
import type { Variant } from "../generated/prisma/client.ts";
import type { PaginationType } from "../type/response.type.ts";

const sortableFields = [
  "id",
  "createdAt",
  "updatedAt",
  "productName",
  "stock",
] as const;

export class VariantValidation {
  static QUERY = z.object({
    productName: z.string().trim().min(1, "Search productName cannot be empty").optional(),
    category: z.string().optional(),
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
    colourCode: z.string().min(1).optional(),
    sizeCode: z.string().min(1).optional(),
    cursor: z.string().optional(),
    take: z.coerce
      .number()
      .int()
      .min(1, "Take must be a positive integer")
      .default(10),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
}

export type VariantValidationQuery = z.infer<typeof VariantValidation.QUERY>;
export type VariantQueryResponse = {
  items: Variant[],
  pagination: PaginationType
}
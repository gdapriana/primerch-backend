import { z } from "zod";
import type { Category } from "../generated/prisma/client";
import type { PaginationType } from "../type/response.type";

const sortableFields = ["id", "createdAt", "updatedAt", "name"] as const;

export class CategoryValidation {
  static QUERY = z.object({
    q: z.string().trim().min(1, "Search query cannot be empty").optional(),
    name: z.string().optional(),
    published: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    cursor: z.string().optional(),
    take: z.coerce
      .number()
      .int()
      .min(1, "Take must be a positive integer")
      .default(10),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("asc"),
  });
  static GET = z.object({
    by: z.enum(["id", "slug"]),
    key: z.string().min(1),
  });
}

export type CategoryValidationQuery = z.infer<typeof CategoryValidation.QUERY>;
export type CategoryValidationGet = z.infer<typeof CategoryValidation.GET>;
export type CategoryQueryResponse = {
  items: Category[];
  pagination: PaginationType;
};

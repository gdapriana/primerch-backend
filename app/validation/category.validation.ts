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

export class CategoryAdminValidation {
  static POST = z.object({
    name: z.string().min(2),
    description: z.string().min(3).optional().nullable(),
    coverId: z.string().min(1).optional().nullable(),
  })
  static PATCH = z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(3).optional().nullable(),
    coverId: z.string().min(1).optional().nullable(),
  })
}

export type CategoryValidationQuery = z.infer<typeof CategoryValidation.QUERY>;
export type CategoryValidationGet = z.infer<typeof CategoryValidation.GET>;
export type CategoryQueryResponse = {
  items: Category[];
  pagination: PaginationType;
};

export type CategoryAdminValidationPost = z.infer<typeof CategoryAdminValidation.POST>;
export type CategoryAdminValidationPatch = z.infer<typeof CategoryAdminValidation.PATCH>;

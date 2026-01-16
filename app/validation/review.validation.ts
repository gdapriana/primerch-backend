import z from "zod";
import type { Review } from "../generated/prisma/client";
import type { PaginationType } from "../type/response.type";

const sortableFields = ["id", "createdAt", "updatedAt"] as const;

export class ReviewValidation {
  static QUERY = z.object({
    published: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    cursor: z.string().optional(),
    take: z.coerce
      .number()
      .int()
      .min(1, "Take must be a positive integer")
      .default(5),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("asc"),
  });
  static CREATE = z.object({
    orderId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1).optional(),
  });
}

export type ReviewValidationCreate = z.infer<typeof ReviewValidation.CREATE>;
export type ReviewValidationQuery = z.infer<typeof ReviewValidation.QUERY>;
export type ReviewQueryResponse = {
  items: Review[];
  pagination: PaginationType;
};

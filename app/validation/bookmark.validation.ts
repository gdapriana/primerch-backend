import z from "zod";

const sortableFields = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "stock",
  "price",
] as const;

export class BookmarkValidation {
  static QUERY = z.object({
    q: z.string().trim().min(1, "Search query cannot be empty").optional(),
    name: z.string().optional(),
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
    minPrice: z.coerce.number().min(0, "Min price must be positive").optional(),
    maxPrice: z.coerce.number().min(0, "Max price must be positive").optional(),
    cursor: z.string().optional(),
    take: z.coerce
      .number()
      .int()
      .min(1, "Take must be a positive integer")
      .default(5),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("asc"),
  });
}

export type BookmarkValidationQuery = z.infer<typeof BookmarkValidation.QUERY>;

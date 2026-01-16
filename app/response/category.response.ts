import type { Prisma } from "../generated/prisma/client";
import { ProductResponse } from "./product.response";

export class CategoryResponse {
  static QUERY: Prisma.CategorySelect = {
    _count: {
      select: {
        products: true,
      },
    },
    cover: {
      select: {
        url: true,
      },
    },
    name: true,
    slug: true,
    id: true,
    createdAt: true,
    updatedAt: true,
  };
  static GET: Prisma.CategorySelect = {
    _count: {
      select: {
        products: true,
      },
    },
    cover: {
      select: {
        url: true,
      },
    },
    description: true,
    name: true,
    slug: true,
    id: true,
    createdAt: true,
    updatedAt: true,
  };
}

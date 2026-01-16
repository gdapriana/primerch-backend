import type { Prisma } from "../generated/prisma/client";

export class ProductResponse {
  static QUERY: Prisma.ProductSelect = {
    _count: true,
    category: {
      select: {
        name: true,
        slug: true,
      },
    },
    variants: {
      select: {
        colour: {
          select: {
            name: true,
            code: true,
          },
        },
        size: {
          select: {
            name: true,
            code: true,
          },
        },
        stock: true,
      },
    },
    description: true,
    cover: {
      select: {
        url: true,
      },
    },
    gender: true,
    id: true,
    reviewCount: true,
    price: true,
    slug: true,
    averageRating: true,
    createdAt: true,
    name: true,
  };
  static GET: Prisma.ProductSelect = {
    id: true,
    createdAt: true,
    updatedAt: true,
    name: true,
    averageRating: true,
    slug: true,
    description: true,
    gender: true,
    price: true,
    category: {
      select: {
        name: true,
        id: true,
        slug: true,
      },
    },
    variants: {
      select: {
        stock: true,
        colour: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        size: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    },
    cover: {
      select: {
        url: true,
      },
    },
    gallery: {
      select: {
        url: true,
      },
    },
    _count: true,
  };
}

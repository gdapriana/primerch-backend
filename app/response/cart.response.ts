import type { CartInclude } from "../generated/prisma/models";

export class CartResponse {
  static GET: CartInclude = {
    products: {
      include: {
        variant: {
          include: {
            product: {
              select: {
                slug: true,
                name: true,
                description: true,
                price: true,
                cover: { select: { url: true } },
              },
            },
            colour: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            size: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    },
  };
}

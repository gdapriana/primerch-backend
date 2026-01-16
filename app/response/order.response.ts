import type { OrderSelect } from "../generated/prisma/models";

export class OrderResponse {
  static GET_USER_ORDER: OrderSelect = {
    status: true,
    _count: {
      select: {
        items: true,
      },
    },
    createdAt: true,
    fullName: true,
    email: true,
    address: true,
    id: true,
    paymentMethod: true,
    phone: true,
    shippingFee: true,
    total: true,
    subtotal: true,
  };
  static GET_USER_ORDER_DETAILS: OrderSelect = {
    _count: {
      select: {
        items: true,
      },
    },
    userId: true,
    address: true,
    createdAt: true,
    email: true,
    fullName: true,
    id: true,
    items: {
      select: {
        id: true,
        quantity: true,
        variant: {
          select: {
            colour: {
              select: {
                code: true,
                name: true,
              },
            },
            size: {
              select: {
                code: true,
                name: true,
              },
            },
            stock: true,
            product: {
              select: {
                name: true,
                cover: {
                  select: {
                    url: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                    slug: true,
                    id: true,
                  },
                },
                description: true,
                slug: true,
                id: true,
                price: true,
              },
            },
          },
        },
      },
    },
    paymentMethod: true,
    phone: true,
    shippingFee: true,
    status: true,
    subtotal: true,
    total: true,
  };
}

import type { OrderInclude, OrderSelect } from "../generated/prisma/models";

// {product.variant?.product.cover?.url ? (
//     <Image
//       src={product.variant.product.cover.url}
//   alt={product.variant.product.name}
//   width={200}
//   loading="lazy"
//   height={200}
//   className="aspect-square w-fit h-full"
//     />
// ) : (
//   <div className="h-full aspect-square bg-muted-foreground/10 flex justify-center items-center">
//   <ImageOff className="text-muted-foreground/15" />
//     </div>
// )}
// </div>
// <div className="flex-1 flex flex-col justify-start items-start">
// <Link
//   href={`/products/${product.variant?.product.slug}`}
// className="font-semibold line-clamp-1"
//   >
//   {product.variant?.product.name}
//   </Link>
//   <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
//   ${product.variant?.product.price.toString()}
// </p>
// <div className="flex gap-1 mt-2">
// <div className="border text-xs w-6 h-6 flex justify-center items-center">
//   {product.variant?.size.code}
//   </div>
//   <div
// style={{
//   backgroundColor: product.variant?.colour.code,
// }}
// className="border w-6 h-6 flex justify-center items-center"
//   ></div>
//   </div>
//   </div>
//   </div>
//   <div className="flex gap-4 justify-end items-center">
// <p>
//   <span className="font-semibold">
//   $
// {(
//   product.quantity *
//   Number(product.variant?.product.price)
// ).toFixed(2)}
// </span>{" "}
// </p>
// </div>

export class OrderResponse {
  static QUERY: OrderInclude = {
    items: {
      select: {
        quantity: true,
        variant: {
          select: {
            product: {
              select: {
                cover: {
                  select: {
                    url: true
                  }
                },
                name: true,
                price: true,
                slug: true,
              }
            },
            size: {select: {name: true, code: true}},
            colour: {select: {name: true, code: true}},
          }
        }
      }
    },
    user: {
      select: {
        email: true,
        id: true,
      }
    }
  }
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

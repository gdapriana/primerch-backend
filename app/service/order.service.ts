import { prismaClient } from "../database/db";
import type { Order } from "../generated/prisma/client";
import {
  ErrorResponseMessage,
  ResponseError,
} from "../response/error.response";
import { OrderResponse } from "../response/order.response";
import type { GetOrderInformationType } from "../type/order.type";
import {
  OrderValidation,
  type OrderQueryResponse,
  type OrderValidationCreateOrder,
  type OrderValidationQuery,
} from "../validation/order.validation";
import Validation from "../validation/validation";
import type { Prisma } from "../generated/prisma/client.ts";

const validation: typeof OrderValidation = OrderValidation;
const shippingFee: number = 5;
const database = prismaClient.order;

export class OrderService {
  static async QUERY(query: OrderValidationQuery): Promise<OrderQueryResponse> {
    const validatedQuery: OrderValidationQuery = Validation.validate(validation.QUERY, query);
    const {order, cursor, address, fullName, take, total, phone, sort, paymentMethod, email, status} = validatedQuery;
    
    const where: Prisma.OrderWhereInput = {
      ...(fullName && { fullName: {contains: fullName, mode: 'insensitive' } }),
      ...(address && { address: {contains: address, mode: 'insensitive' } }),
      ...(phone && { phone: {contains: phone, mode: 'insensitive' } }),
      ...(paymentMethod && { paymentMethod }),
      ...(status && { status }),
      ...(email && { email: {contains: email, mode: 'insensitive' } }),
      ...(total && { total }),
    }

    let orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sort]: order,
    }
    const [orders, totalFiltered, totalAll] = await Promise.all([
      database.findMany({
        where,
        orderBy,
        take: take + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        include: {
          items: {
            select: {
              quantity: true,
              variant: true
            }
          }
        }
      }),
      database.count({where}),
      database.count()
    ])


    const hasNext = orders.length > take;
    const items = hasNext ? orders.slice(0, take) : orders;

    return {
      items,
      pagination: {
        take,
        hasNext,
        nextCursor: hasNext ? items[items.length - 1]?.id : null,
        totalFiltered,
        totalAll,
      }
    }
  }
  static async GET_USER_ORDER(
    userId: string,
    query: OrderValidationQuery
  ): Promise<OrderQueryResponse> {
    const validatedQuery: OrderValidationQuery = Validation.validate(
      validation.QUERY,
      query
    );

    const { order, sort, take, cursor } = validatedQuery;

    const [orders, totalFiltered, totalAll] = await Promise.all([
      database.findMany({
        where: {
          userId,
        },
        orderBy: {
          [sort]: order,
        },
        take: take + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        select: OrderResponse.GET_USER_ORDER,
      }),
      database.count(),
      database.count({ where: { userId } }),
    ]);
    const hasNext = orders.length > take;
    const items = hasNext ? orders.slice(0, take) : orders;
    return {
      items,
      pagination: {
        hasNext,
        take,
        nextCursor: hasNext ? items[items.length - 1]?.id : null,
        totalFiltered,
        totalAll,
      },
    };
  }
  static async GET_USER_ORDER_DETAILS(
    userId: string,
    orderId?: string
  ): Promise<Order> {
    const order = await database.findUnique({
      where: { id: orderId },
      select: OrderResponse.GET_USER_ORDER_DETAILS,
    });
    if (!order)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("order"));
    if (userId !== order.userId)
      throw new ResponseError(ErrorResponseMessage.FORBIDDEN());
    return order;
  }
  static async GET_ORDER_INFORMATION(
    userId: string
  ): Promise<GetOrderInformationType> {
    const transaction = await prismaClient.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          products: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
      });
      if (!cart || cart.products.length === 0)
        throw new ResponseError(ErrorResponseMessage.NOT_FOUND("product"));

      let subtotal = 0;

      for (const item of cart.products) {
        if (!item.variant)
          throw new ResponseError(ErrorResponseMessage.NOT_FOUND("variant"));

        if (item.quantity > item.variant.stock) {
          throw new ResponseError(
            ErrorResponseMessage.BAD_REQUEST(
              `Insufficient stock for ${item.variant.product.name}`
            )
          );
        }

        const itemPrice =
          Number(item.variant.product.price) +
          Number(item.variant.priceModifier);
        subtotal += itemPrice * item.quantity;
      }
      const total = subtotal + shippingFee;
      return {
        subtotal,
        total,
      };
    });
    if (!transaction)
      throw new ResponseError(ErrorResponseMessage.INTERNAL_SERVER_ERROR());
    return {
      shippingFee,
      ...transaction,
    };
  }
  static async CREATE_ORDER(
    body: OrderValidationCreateOrder,
    userId: string
  ): Promise<{ id: string }> {
    const validatedBody: OrderValidationCreateOrder = Validation.validate(
      validation.CREATE_ORDER,
      body
    );
    const transaction = await prismaClient.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          products: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
      });

      if (!cart || cart.products.length === 0)
        throw new ResponseError(ErrorResponseMessage.NOT_FOUND("product"));

      let subtotal = 0;

      for (const item of cart.products) {
        if (!item.variant)
          throw new ResponseError(ErrorResponseMessage.NOT_FOUND("variant"));

        if (item.quantity > item.variant.stock) {
          throw new ResponseError(
            ErrorResponseMessage.BAD_REQUEST(
              `Insufficient stock for ${item.variant.product.name}`
            )
          );
        }

        const itemPrice =
          Number(item.variant.product.price) +
          Number(item.variant.priceModifier);
        subtotal += itemPrice * item.quantity;
      }

      const total = subtotal + shippingFee;
      const order = await tx.order.create({
        data: {
          userId: userId,
          paymentMethod: validatedBody.paymentMethod,
          subtotal: subtotal,
          fullName: validatedBody.fullName,
          email: validatedBody.email,
          address: validatedBody.address,
          phone: validatedBody.phone,
          shippingFee: shippingFee,
          total: total,
          items: {
            create: cart.products.map((item) => ({
              quantity: item.quantity,
              variantId: item.variantId,
            })),
          },
        },
        select: { id: true },
      });
      for (const item of cart.products) {
        await tx.variant.update({
          where: { id: item.variantId!, stock: { gte: item.quantity } },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
      await tx.productInCart.deleteMany({
        where: { cartId: cart.id },
      });
      return order;
    });
    if (!transaction)
      throw new ResponseError(ErrorResponseMessage.INTERNAL_SERVER_ERROR());
    return transaction;
  }
}

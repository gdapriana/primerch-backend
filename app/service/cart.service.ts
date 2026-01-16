import { prismaClient } from "../database/db";
import type { Cart } from "../generated/prisma/client";
import { CartResponse } from "../response/cart.response";
import {
  ErrorResponseMessage,
  ResponseError,
} from "../response/error.response";
import {
  CartValidation,
  type CartValidationAddProduct,
} from "../validation/cart.validation";
import Validation from "../validation/validation";

const database = prismaClient.cart;
const validation = CartValidation;

export class CartService {
  static async GET(userId: string): Promise<Cart> {
    const cart = await database.findUnique({
      where: { userId },
      include: CartResponse.GET,
    });
    if (!cart) throw new ResponseError(ErrorResponseMessage.NOT_FOUND("cart"));
    return cart;
  }

  static async ADD_PRODUCT(
    userId: string,
    body: CartValidationAddProduct
  ): Promise<{ id: string }> {
    const validatedBody: CartValidationAddProduct = Validation.validate(
      validation.ADD_PRODUCT,
      body
    );
    const checkCart = await database.findUnique({
      where: { id: validatedBody.cartId },
      select: { userId: true, products: { select: { variantId: true } } },
    });
    if (!checkCart)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("cart"));
    if (userId !== checkCart.userId)
      throw new ResponseError(ErrorResponseMessage.FORBIDDEN());

    const checkVariant = await prismaClient.variant.findUnique({
      where: {
        productId_colourId_sizeId: {
          productId: validatedBody.productId,
          colourId: validatedBody.colourId,
          sizeId: validatedBody.sizeId,
        },
      },
      select: { stock: true, id: true },
    });
    if (!checkVariant)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("variant"));
    if (checkVariant.stock === 0)
      throw new ResponseError(ErrorResponseMessage.BAD_REQUEST("out of stock"));

    const checkProductInCart = await prismaClient.productInCart.findFirst({
      where: {
        AND: [{ variantId: checkVariant.id }, { cartId: validatedBody.cartId }],
      },
    });

    if (checkProductInCart)
      throw new ResponseError(ErrorResponseMessage.ALREADY_EXISTS("product"));

    return prismaClient.productInCart.create({
      data: {
        cartId: validatedBody.cartId,
        variantId: checkVariant.id,
      },
      select: { id: true },
    });
  }

  static async PATCH_QUANTITY(
    inc: boolean,
    userId: string,
    productInCartId?: string
  ): Promise<{
    id: string;
    inc: boolean;
    dec: boolean;
    currentQuantity: number;
    stock: number;
  }> {
    const checkProductInCart = await prismaClient.productInCart.findUnique({
      where: { id: productInCartId },
      select: {
        quantity: true,
        cart: { select: { userId: true } },
        variant: { select: { stock: true } },
      },
    });
    if (!checkProductInCart)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("cart"));
    if (userId !== checkProductInCart?.cart?.userId) {
      console.log({ userId, cartUserId: checkProductInCart.cart?.userId });
      throw new ResponseError(ErrorResponseMessage.FORBIDDEN());
    }
    if (!checkProductInCart.variant)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("variant"));

    if (inc) {
      if (checkProductInCart.quantity >= checkProductInCart.variant.stock)
        throw new ResponseError(
          ErrorResponseMessage.BAD_REQUEST("maximum of stock")
        );

      const updatedCart = await prismaClient.productInCart.update({
        where: {
          id: productInCartId,
        },
        data: {
          quantity: checkProductInCart.quantity + 1,
        },
        select: {
          id: true,
          quantity: true,
        },
      });

      return {
        id: updatedCart.id,
        inc: checkProductInCart.quantity < checkProductInCart.variant.stock,
        dec: checkProductInCart.quantity > 1,
        currentQuantity: updatedCart.quantity,
        stock: checkProductInCart.variant.stock,
      };
    } else {
      if (checkProductInCart.quantity <= 1)
        throw new ResponseError(
          ErrorResponseMessage.BAD_REQUEST("minimum of stock")
        );

      const updatedCart = await prismaClient.productInCart.update({
        where: {
          id: productInCartId,
        },
        data: {
          quantity: checkProductInCart.quantity - 1,
        },
        select: {
          id: true,
          quantity: true,
        },
      });
      return {
        id: updatedCart.id,
        inc: checkProductInCart.quantity < 1,
        dec: checkProductInCart.quantity > 1,
        currentQuantity: updatedCart.quantity,
        stock: checkProductInCart.variant.stock,
      };
    }
  }

  static async DELETE_PRODUCT(
    userId: string,
    productInCartId?: string
  ): Promise<{ id: string }> {
    const checkProductInCart = await prismaClient.productInCart.findUnique({
      where: { id: productInCartId },
      select: { cart: { select: { userId: true } } },
    });
    if (!checkProductInCart)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("variant"));
    if (userId !== checkProductInCart.cart?.userId)
      throw new ResponseError(ErrorResponseMessage.FORBIDDEN());

    return prismaClient.productInCart.delete({
      where: { id: productInCartId },
      select: { id: true },
    });
  }
}

import type { Request, Response, NextFunction } from "express";
import type { UserRequest } from "../type/request.type";
import type { Cart } from "../generated/prisma/client";
import { CartService } from "../service/cart.service";
import { SuccessReponse } from "../response/success.response";

export class CartController {
  static async GET(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const response: Cart = await CartService.GET(userId);
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }

  static async ADD_PRODUCT(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body;
      const userId = req.user?.id!;
      const response: { id: string } = await CartService.ADD_PRODUCT(
        userId,
        body
      );
      res.status(200).json({
        ...SuccessReponse.PATCH_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }

  static async PATCH_INC_QUANTITY(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productInCartId } = req.params;
      const userId = req.user?.id!;
      const response: {
        id: string;
        inc: boolean;
        dec: boolean;
        currentQuantity: number;
        stock: number;
      } = await CartService.PATCH_QUANTITY(true, userId, productInCartId);
      res.status(200).json({
        ...SuccessReponse.PATCH_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }

  static async PATCH_DEC_QUANTITY(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productInCartId } = req.params;
      const userId = req.user?.id!;
      const response: { id: string; inc: boolean; dec: boolean } =
        await CartService.PATCH_QUANTITY(false, userId, productInCartId);
      res.status(200).json({
        ...SuccessReponse.PATCH_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }

  static async DELETE_PRODUCT(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productInCartId } = req.params;
      const userId = req.user?.id!;
      const response: { id: string } = await CartService.DELETE_PRODUCT(
        userId,
        productInCartId
      );
      res.status(200).json({
        ...SuccessReponse.DELETE_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
}

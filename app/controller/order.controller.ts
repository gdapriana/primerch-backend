import type { Response, NextFunction } from "express";
import type { UserRequest } from "../type/request.type";
import { OrderService } from "../service/order.service";
import { SuccessReponse } from "../response/success.response";
import type { GetOrderInformationType } from "../type/order.type";
import type { Order } from "../generated/prisma/client";
import type { OrderQueryResponse } from "../validation/order.validation";

export class OrderController {
  static async QUERY(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as any
      const response: OrderQueryResponse = await OrderService.QUERY(query);
      res.status(200).json({...SuccessReponse.QUERY_ITEM, result: response});
    } catch (e) {
      next(e)
    }
  }
  static async GET_USER_ORDER(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const query = req.query as any;
      const response: OrderQueryResponse = await OrderService.GET_USER_ORDER(
        userId,
        query
      );
      res.status(200).json({
        ...SuccessReponse.QUERY_ITEM,
        result: response,
      });
    } catch (e) {
      next(e);
    }
  }
  static async GET_USER_ORDER_DETAILS(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { orderId } = req.params;
      const response: Order = await OrderService.GET_USER_ORDER_DETAILS(
        userId,
        orderId
      );
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: {
          item: response,
          pagination: null,
        },
      });
    } catch (e) {
      next(e);
    }
  }
  static async GET_ORDER_INFORMATION(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const response: GetOrderInformationType =
        await OrderService.GET_ORDER_INFORMATION(userId);
      res.status(200).json({
        ...SuccessReponse.POST_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
  static async CREATE_ORDER(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body;
      const userId = req.user?.id!;
      const response: { id: string } = await OrderService.CREATE_ORDER(
        body,
        userId
      );
      res.status(200).json({
        ...SuccessReponse.POST_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
  static async UPDATE_ORDER_STATUS(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { orderId } = req.params;
    const body = req.body;
    const response: {id: string} = await OrderService.UPDATE_ORDER_STATUS(body, orderId);
    res.status(200).json({...SuccessReponse.PATCH_ITEM, result: {item: response, pagination: null}});
    try {
    } catch (e) {
      next(e);
    } 
  }
}

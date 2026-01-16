import type { NextFunction, Response, Request } from "express";
import type { UserRequest } from "../type/request.type";
import { SuccessReponse } from "../response/success.response";
import { BookmarkService } from "../service/bookmark.service";
import type { ProductQueryResponse } from "../validation/product.validation";

export class BookmarkController {
  static async CHECK(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { productId } = req.params;
      const response: boolean = await BookmarkService.CHECK(productId, userId);
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }

  static async QUERY(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const query = req.query as any;
      const { pagination, items }: ProductQueryResponse =
        await BookmarkService.QUERY(userId, query);
      res.status(200).json({
        ...SuccessReponse.QUERY_ITEM,
        result: { items, pagination },
      });
    } catch (e) {
      next(e);
    }
  }

  static async COUNT_ALL(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const response: number = await BookmarkService.COUNT_ALL(productId);
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
  static async TOGGLE(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const userId = req.user?.id!;
      const response: { productId: string } = await BookmarkService.TOGGLE(
        userId,
        productId
      );

      res.status(200).json({
        ...SuccessReponse.PATCH_ITEM,
        result: { item: response.productId, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
}

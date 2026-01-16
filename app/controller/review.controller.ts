import type { NextFunction, Response } from "express";
import type { UserRequest } from "../type/request.type";
import { ReviewService } from "../service/review.service";
import { SuccessReponse } from "../response/success.response";
import type { Review } from "../generated/prisma/client";

export class ReviewController {
  static async CHECK_IS_REVIEWED(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const userId = req.user?.id!;
      const response: Review = await ReviewService.CHECK_IS_REVIEWED(
        userId,
        productId
      );
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
  static async TOTAL(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const response: number = await ReviewService.TOTAL(productId);
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
      const query = req.query as any;
      const { productId } = req.params;
      const { items, pagination } = await ReviewService.QUERY(query, productId);
      res
        .status(200)
        .json({ ...SuccessReponse.QUERY_ITEM, result: { items, pagination } });
    } catch (e) {
      next(e);
    }
  }
  static async CREATE(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body;
      const { productId } = req.params;
      const userId = req.user?.id!;
      const response: { reviewId: string } = await ReviewService.CREATE(
        body,
        userId,
        productId
      );
      res.status(200).json({
        ...SuccessReponse.POST_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
}

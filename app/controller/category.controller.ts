import type { Request, Response, NextFunction } from "express";
import { SuccessReponse } from "../response/success.response";
import type { Category } from "../generated/prisma/client";
import { CategoryService } from "../service/category.service";
import type { CategoryQueryResponse } from "../validation/category.validation";

export class CategoryController {
  static async QUERY(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as any;
      const response: CategoryQueryResponse = await CategoryService.QUERY(
        query
      );
      res.status(200).json({ ...SuccessReponse.QUERY_ITEM, result: response });
    } catch (e) {
      next(e);
    }
  }
  static async GET(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { by, key } = req.query as any;
      const response: Category = await CategoryService.GET(by, key);
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
}

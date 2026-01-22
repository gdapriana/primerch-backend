import type { Request, Response, NextFunction } from "express";
import { SuccessReponse } from "../response/success.response";
import type { Category, Media } from "../generated/prisma/client";
import { CategoryAdminService, CategoryService } from "../service/category.service";
import type { CategoryQueryResponse } from "../validation/category.validation";
import type { UserRequest } from "../type/request.type.ts";

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

export class CategoryAdminController {
  static async GET_CATEGORY(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
     const { categoryId } = req.params as any;
     const response: Category = await CategoryAdminService.GET_CATEGORY(categoryId);
     res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
  static async GET_COVER(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params as any;
      const response: Media = await CategoryAdminService.GET_COVER(categoryId);
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
  static async GET_PRODUCTS(): Promise<void> {}
  static async POST_CATEGORIES(): Promise<void> {}
  static async PATCH_CATEGORIES(): Promise<void> {}
  static async DELETE_CATEGORIES(): Promise<void> {}
}
import type { Request, Response, NextFunction } from "express";
import { SuccessReponse } from "../response/success.response";
import type { ProductQueryResponse } from "../validation/product.validation";
import { ProductHelperService, ProductService } from "../service/product.service";
import type { Product } from "../generated/prisma/client";
import type { UserRequest } from "../type/request.type.ts";

export class ProductController {
  static async QUERY(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as any;
      const response: ProductQueryResponse = await ProductService.QUERY(query);
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
      const response: Product = await ProductService.GET(by, key);
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }

  static async POST(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body;
      const response: { id: string } = await ProductService.POST(body);
      res.status(200).json({
        ...SuccessReponse.POST_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
}
export class ProductHelperController {
  static async STOCK(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body
      const response: number = await ProductHelperService.STOCK(body);
      res.status(200).json({...SuccessReponse.GET_ITEM, result: {item: response, pagination: null }});
    } catch (e) {
      next(e);
    }
  }
}
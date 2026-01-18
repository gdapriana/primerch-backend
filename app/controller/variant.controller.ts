import type { UserRequest } from "../type/request.type.ts";
import type { NextFunction, Response } from "express";
import type { VariantQueryResponse } from "../validation/variant.validation.ts";
import { VariantService } from "../service/variant.service.ts";
import { SuccessReponse } from "../response/success.response.ts";

export class VariantController {
  static async QUERY(
    req: UserRequest,
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as any;
      const response: VariantQueryResponse = await VariantService.QUERY(query);
      res.status(200).json({...SuccessReponse.QUERY_ITEM, result: response});
    } catch (e) {
      next(e)
    }
  }
}
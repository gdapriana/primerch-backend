import type { UserRequest } from "../type/request.type.ts";
import type { NextFunction, Response } from "express";
import type { Media } from "../generated/prisma/client.ts";
import { MediaService } from "../service/media.service.ts";
import { SuccessReponse } from "../response/success.response.ts";

export class MediaController {
  static async QUERY_PRODUCT_GALLERY(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {productId} = req.params;
      const response: Media[] = await MediaService.QUERY_PRODUCT_GALLERY(productId)
      res.status(200).json({...SuccessReponse.QUERY_ITEM, result: {items: response, pagination: null}});
    } catch (e) {
      next(e)
    }
  }
}
import type { UserRequest } from "../type/request.type.ts";
import type { NextFunction, Response } from "express";
import { ErrorResponseMessage, ResponseError } from "../response/error.response.ts";

export const adminMiddleware = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    next(new ResponseError(ErrorResponseMessage.UNAUTHORIZED()));
    return;
  }
  next();
}
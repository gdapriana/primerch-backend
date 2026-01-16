import type { Response, Request, NextFunction } from "express";
import {
  ErrorResponseMessage,
  ResponseError,
} from "../response/error.response.ts";
import { success, ZodError } from "zod";
import { TokenExpiredError } from "jsonwebtoken";

export const errorMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((err) => {
      const field = err.path.join(".");
      return {
        field: field,
        error: err.message,
      };
    });

    const { status } = ErrorResponseMessage.BAD_REQUEST("invalid request data");

    res.status(status).json({
      status: 400,
      success: false,
      message: "invalid request data",
      details: formattedErrors,
    });
  } else if (error instanceof ResponseError) {
    res.status(error.data.status).json({
      status: error.data.status,
      success: false,
      message: error.data.message,
      details: null,
    });
  } else if (error instanceof TokenExpiredError) {
    const { status, message } =
      ErrorResponseMessage.UNAUTHORIZED("token has expired");
    res.status(status).json({
      status: 401,
      success: false,
      message: "token expired",
      details: message,
    });
  } else {
    const { status, message } = ErrorResponseMessage.INTERNAL_SERVER_ERROR();
    res.status(status).json({
      status: 500,
      success: false,
      message: message,
      details: null,
    });
  }
};

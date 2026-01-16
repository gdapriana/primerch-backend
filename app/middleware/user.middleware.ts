import type { NextFunction, Response } from "express";
import {
  ErrorResponseMessage,
  ResponseError,
} from "../response/error.response.ts";
import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import type { UserRequest } from "../type/request.type.ts";
import type { UserPayload } from "../helper/token.helper";

export const userMiddleware = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader: string | undefined = req.headers.authorization;
  const token: string | undefined = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next(new ResponseError(ErrorResponseMessage.UNAUTHORIZED()));
  } else {
    try {
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
        (
          err: VerifyErrors | null,
          decoded: string | JwtPayload | undefined
        ) => {
          if (err) {
            if (err?.name === "TokenExpiredError") {
              next(
                new ResponseError(
                  ErrorResponseMessage.UNAUTHORIZED("token has expired")
                )
              );
            }
            next(
              new ResponseError(
                ErrorResponseMessage.UNAUTHORIZED("invalid token")
              )
            );
          }
          req.user = decoded as UserPayload;
          next();
        }
      );
    } catch (error) {
      next(new ResponseError(ErrorResponseMessage.FORBIDDEN()));
    }
  }
};

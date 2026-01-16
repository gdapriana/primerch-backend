import jwt from "jsonwebtoken";
import {
  ErrorResponseMessage,
  ResponseError,
} from "../response/error.response.ts";
import type { ROLE } from "../generated/prisma/enums.ts";

export type UserPayload = {
  id: string;
  email: string;
  role: ROLE;
};

export class GenerateToken {
  static accessToken(payload: UserPayload): string {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "30m",
    });
  }

  static refreshToken(payload: UserPayload): string {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });
  }

  static renewToken(refreshToken: string): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
        (err, decoded) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              return reject(
                new ResponseError(
                  ErrorResponseMessage.UNAUTHORIZED(
                    "session ended, please login again"
                  )
                )
              );
            }
            return reject(new ResponseError(ErrorResponseMessage.FORBIDDEN()));
          }
          if (typeof decoded === "object" && decoded !== null) {
            const userPayload: UserPayload = {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
            };
            const newAccessToken = this.accessToken(userPayload);
            resolve(newAccessToken);
          } else {
            reject(
              new ResponseError(
                ErrorResponseMessage.BAD_REQUEST("invalid token payload")
              )
            );
          }
        }
      );
    });
  }
}

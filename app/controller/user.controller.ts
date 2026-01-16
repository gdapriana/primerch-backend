import type { Request, Response, NextFunction } from "express";
import { UserService } from "../service/user.service";
import { SuccessReponse } from "../response/success.response";
import type { UserRequest } from "../type/request.type";
import type { ROLE, User } from "../generated/prisma/client";

export class UserController {
  static async REGISTER(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const response: { id: string } = await UserService.REGISTER(body);
      res.status(200).json({ ...SuccessReponse.REGISTER, result: response });
    } catch (e) {
      next(e);
    }
  }
  static async LOGIN(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const response: {
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; role: ROLE };
      } = await UserService.LOGIN(body);

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 168 * 1000,
        secure: false,
      });

      res.status(200).json({
        ...SuccessReponse.LOGIN,
        result: {
          item: { accessToken: response.accessToken, user: response.user },
          pagination: null,
        },
      });
    } catch (e) {
      next(e);
    }
  }
  static async ME(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id!;
      const response: User = await UserService.ME(userId);
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: { item: response, pagination: null },
      });
    } catch (e) {
      next(e);
    }
  }
  static async REFRESH(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken: string | undefined = req.cookies.refreshToken;
      const response: string = await UserService.REFRESH_TOKEN(refreshToken);
      res.status(200).json({
        ...SuccessReponse.GET_ITEM,
        result: {
          item: {
            newAccessToken: response,
          },
          pagination: null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

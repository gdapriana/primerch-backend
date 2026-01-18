import { prismaClient } from "../database/db";
import type { ROLE, User } from "../generated/prisma/client.ts";
import { GenerateToken } from "../helper/token.helper.ts";
import {
  ErrorResponseMessage,
  ResponseError,
  type Schema,
} from "../response/error.response.ts";
import { UserResponse } from "../response/user.response.ts";
import {
  UserValidation,
  type UserValidationLogin,
  type UserValidationRegister,
} from "../validation/user.validation.ts";
import Validation from "../validation/validation.ts";
import bcrypt from "bcrypt";

const database = prismaClient.user;
const validation: typeof UserValidation = UserValidation;

export class UserService {
  static async REGISTER(body: UserValidationRegister): Promise<{ id: string }> {
    const validatedBody: UserValidationRegister = Validation.validate(
      validation.REGISTER,
      body
    );
    const user = await database.findUnique({
      where: { email: validatedBody.email },
    });
    if (user)
      throw new ResponseError(ErrorResponseMessage.INVALID_USERNAME_PASSWORD());
    validatedBody.password = await bcrypt.hash(validatedBody.password, 10);
    return database.create({
      data: validatedBody,
      select: { id: true },
    });
  }
  static async LOGIN(body: UserValidationLogin): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; role: ROLE };
  }> {
    const validatedBody: UserValidationLogin = Validation.validate(
      validation.LOGIN,
      body
    );

    const user = await database.findUnique({
      where: { email: validatedBody.email },
      select: { id: true, password: true, email: true, role: true },
    });
    if (!user)
      throw new ResponseError(ErrorResponseMessage.INVALID_USERNAME_PASSWORD());

    const isPasswordMatch: boolean = await bcrypt.compare(
      validatedBody.password,
      user.password!
    );

    if (!isPasswordMatch)
      throw new ResponseError(ErrorResponseMessage.INVALID_USERNAME_PASSWORD());

    const accessToken = GenerateToken.accessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = GenerateToken.refreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await database.update({
      where: { email: validatedBody.email },
      data: {
        refreshToken,
        accessToken,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        role: user.role,
        id: user.id,
      },
    };
  }
  static async ME(userId: string): Promise<User> {
    const user = await database.findUnique({
      where: { id: userId },
      select: UserResponse.ME,
    });
    if (!user) throw new ResponseError(ErrorResponseMessage.FORBIDDEN());
    return user;
  }
  static async REFRESH_TOKEN(
    refreshToken: string | undefined
  ): Promise<string> {
    if (!refreshToken)
      throw new ResponseError(ErrorResponseMessage.UNAUTHORIZED());
    const userCheck: User | null = await database.findFirst({
      where: { refreshToken: refreshToken },
    });
    if (!userCheck) throw new ResponseError(ErrorResponseMessage.FORBIDDEN());
    return GenerateToken.renewToken(refreshToken);
  }
  static async LOGOUT(userId: string): Promise<{id: string}> {
    const user = await database.findFirst({
      where: { id: userId },
      select: {email: true, id: true}
    })
    if (!user) throw new ResponseError(ErrorResponseMessage.FORBIDDEN());
    await database.updateMany({
      where: {email: user.email},
      data: {
        refreshToken: undefined,
        accessToken: undefined,
      }
    })
    return {id: user.id}
  }
}

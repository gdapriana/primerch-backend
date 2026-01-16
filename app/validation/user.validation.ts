import z from "zod";

export class UserValidation {
  static REGISTER = z.object({
    email: z.string().email(),
    password: z.string(),
  });
  static LOGIN = z.object({
    email: z.string().email(),
    password: z.string(),
  });
}

export type UserValidationLogin = z.infer<typeof UserValidation.LOGIN>;
export type UserValidationRegister = z.infer<typeof UserValidation.REGISTER>;

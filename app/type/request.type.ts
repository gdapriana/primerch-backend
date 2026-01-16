import type { Request } from "express";
import type { UserPayload } from "../helper/token.helper";

export interface UserRequest extends Request {
  user?: UserPayload;
}

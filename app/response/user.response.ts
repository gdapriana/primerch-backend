import type { UserSelect } from "../generated/prisma/models";

export class UserResponse {
  static ME: UserSelect = {
    accessToken: true,
    id: true,
    role: true,
    email: true,
  };
}

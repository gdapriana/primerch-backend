import { Prisma } from "../generated/prisma/client";

export class ReviewResponse {
  static QUERY: Prisma.ReviewSelect = {
    comment: true,
    createdAt: true,
    id: true,
    rating: true,
    user: {
      select: {
        email: true,
      },
    },
  };
  static CHECK_IS_REVIEWED: Prisma.ReviewSelect = {
    comment: true,
    rating: true,
    createdAt: true,
  };
}

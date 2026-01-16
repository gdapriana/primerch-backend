import { prismaClient } from "../database/db";
import type { Review } from "../generated/prisma/client";
import {
  ErrorResponseMessage,
  ResponseError,
} from "../response/error.response";
import { ReviewResponse } from "../response/review.response";
import {
  ReviewValidation,
  type ReviewQueryResponse,
  type ReviewValidationCreate,
  type ReviewValidationQuery,
} from "../validation/review.validation";
import Validation from "../validation/validation";

const database = prismaClient.review;
const validation: typeof ReviewValidation = ReviewValidation;

export class ReviewService {
  static async CHECK_IS_REVIEWED(
    userId: string,
    productId?: string
  ): Promise<Review> {
    if (!productId)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("product"));
    const review = await database.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: productId,
        },
      },
      select: ReviewResponse.CHECK_IS_REVIEWED,
    });
    if (!review)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("review"));
    return review;
  }

  static async TOTAL(productId?: string): Promise<number> {
    return database.count({
      where: {
        productId,
        published: true,
      },
    });
  }
  static async QUERY(
    query: ReviewValidationQuery,
    productId?: string
  ): Promise<ReviewQueryResponse> {
    const validatedQuery: ReviewValidationQuery = Validation.validate(
      validation.QUERY,
      query
    );

    const { order, sort, take, cursor, published } = validatedQuery;

    const [reviews, totalFiltered, totalAll] = await Promise.all([
      database.findMany({
        where: {
          published,
          productId,
        },
        orderBy: {
          [sort]: order,
        },
        take: take + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        select: ReviewResponse.QUERY,
      }),
      database.count({ where: { productId } }),
      database.count({ where: { productId } }),
    ]);
    const hasNext = reviews.length > take;
    const items = hasNext ? reviews.slice(0, take) : reviews;

    return {
      items,
      pagination: {
        take,
        hasNext,
        nextCursor: hasNext ? items[items.length - 1]?.id : null,
        totalFiltered,
        totalAll,
      },
    };
  }
  static async CREATE(
    body: ReviewValidationCreate,
    userId: string,
    productId?: string
  ): Promise<{ reviewId: string }> {
    if (!productId)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("product"));
    const validatedBody: ReviewValidationCreate = Validation.validate(
      validation.CREATE,
      body
    );

    const order = await prismaClient.order.findFirst({
      where: {
        id: validatedBody.orderId,
        userId,
        status: "COMPLETED",
      },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!order)
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("order"));

    const hasProducts = order.items.some(
      (item) => item.variant?.productId === productId
    );

    if (!hasProducts) {
      throw new ResponseError(ErrorResponseMessage.NOT_FOUND("product"));
    }

    const existingReview = await database.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: productId,
        },
      },
      select: { id: true },
    });
    if (existingReview)
      throw new ResponseError(ErrorResponseMessage.ALREADY_EXISTS("review"));

    return prismaClient.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          productId: productId,
          orderId: validatedBody.orderId,
          rating: validatedBody.rating,
          comment: validatedBody.comment,
        },
        select: {
          id: true,
        },
      });

      const stats = await tx.review.aggregate({
        where: {
          productId: productId,
          published: true,
        },
        _avg: { rating: true },
        _count: true,
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          averageRating: stats._avg.rating ?? 0,
          reviewCount: stats._count,
        },
      });

      return {
        reviewId: review.id,
      };
    });
  }
}

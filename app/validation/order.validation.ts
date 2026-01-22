import z from "zod";
import { type Order, ORDER_STATUS, PAYMENT_METHOD } from "../generated/prisma/client";
import type { PaginationType } from "../type/response.type";

const sortableFields = ["createdAt", "updatedAt", "fullName", "email", "total"] as const;

export class OrderValidation {
  static QUERY = z.object({
    q: z.string().optional(),
    cursor: z.string().optional(),
    status: z.enum(ORDER_STATUS).optional(),
    paymentMethod: z.enum(PAYMENT_METHOD).optional(),
    total: z.coerce
      .number()
      .int()
      .min(1, "Take must be a positive integer").optional(),
    take: z.coerce
      .number()
      .int()
      .min(1, "Take must be a positive integer")
      .default(5),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("asc"),
  });
  static CREATE_ORDER = z.object({
    paymentRef: z.string().optional().nullable(),
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string(),
    address: z.string().min(3),
    status: z
      .enum([
        "PENDING",
        "PAID",
        "FAILED",
        "CANCELLED",
        "SHIPPED",
        "COMPLETED",
        "REFUNDED",
      ])
      .default("PENDING"),
    paymentMethod: z
      .enum([
        "CASH_ON_DELIVERY",
        "BANK_TRANSFER",
        "VIRTUAL_ACCOUNT",
        "QRIS",
        "E_WALLET_DANA",
        "E_WALLET_OVO",
        "E_WALLET_GOPAY",
        "E_WALLET_SHOPEEPAY",
        "CREDIT_CARD",
        "DEBIT_CARD",
      ])
      .default("CASH_ON_DELIVERY"),
  });
  static UPDATE_ORDER_STATUS = z.object({
    status: z.enum(ORDER_STATUS),
  });
}

export type OrderValidationQuery = z.infer<typeof OrderValidation.QUERY>;
export type OrderValidationCreateOrder = z.infer<
  typeof OrderValidation.CREATE_ORDER
>;
export type OrderValidationUpdateOrderStatus = z.infer<typeof OrderValidation.UPDATE_ORDER_STATUS>;

export type OrderQueryResponse = {
  items: Order[];
  pagination: PaginationType;
};

import z from "zod";

export class CartValidation {
  static ADD_PRODUCT = z.object({
    cartId: z.string().min(1),
    productId: z.string().min(1),
    colourId: z.string().min(1),
    sizeId: z.string().min(1),
  });
}

export type CartValidationAddProduct = z.infer<
  typeof CartValidation.ADD_PRODUCT
>;

import type { Prisma } from "../generated/prisma/client";

export class VariantResponse {
  static QUERY: Prisma.VariantInclude  = {
    product: {
      select: {
        name: true,
        id: true,
        slug: true,
        cover: {
          select: {
            url: true,
          }
        }
      }
    },
    colour: {
      select: {
        name: true,
        code: true
      }
    },
    size: {
      select: {
        name: true,
        code: true
      }
    }
  }
}
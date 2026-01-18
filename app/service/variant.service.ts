import type { Variant } from "../generated/prisma/client.ts";
import {
  type VariantQueryResponse,
  VariantValidation,
  type VariantValidationQuery
} from "../validation/variant.validation.ts";
import { prismaClient } from "../database/db.ts";
import type { Schema } from "../response/error.response.ts";
import Validation from "../validation/validation.ts";
import type { Prisma } from "../generated/prisma/client.ts";
import { VariantResponse } from "../response/variant.response.ts";

const database = prismaClient.variant
const schema: Schema = "variant";
const validation: typeof VariantValidation = VariantValidation

export class VariantService {
  static async QUERY(query: VariantValidationQuery): Promise<VariantQueryResponse> {
    const validatedQuery: VariantValidationQuery = Validation.validate(validation.QUERY, query);
    
    const {cursor, take, category, sort, order, maxStock, minStock, productName, sizeCode, colourCode } = validatedQuery;
    
    const where: Prisma.VariantWhereInput = {
      ...(productName && {
        product: {
          name: {
            contains: productName.toLowerCase(),
            mode: "insensitive"
          },
        }
      }),
      ...(category && {
        category: {
          slug: category,
        },
      }),
      ...(colourCode && {
        colour: {
          code: {
            contains: colourCode.toLowerCase(),
            mode: "insensitive"
          }
        }
      }),
      ...(sizeCode && {
        size: {
          code: {
            contains: sizeCode.toLowerCase(),
            mode: "insensitive"
          }
        }
      }),
      ...((minStock !== undefined || maxStock !== undefined) && {
        stock: {
          ...(minStock !== undefined && { gte: minStock }),
          ...(maxStock !== undefined && { lte: maxStock }),
        },
      }),
    }


    let orderBy: Prisma.VariantOrderByWithRelationInput = {
      [sort]: order,
    }
    
    if (sort === 'productName') {
      orderBy = {
        product: {
          name: order
        }
      }
    }
    
    const [variants, totalFiltered, totalAll] = await Promise.all([
      database.findMany({
        where,
        include: VariantResponse.QUERY,
        orderBy,
        take: take + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      }),
      database.count({ where }),
      database.count()
    ])

    const hasNext = variants.length > take;
    const items = hasNext ? variants.slice(0, take) : variants;
    
    return {
      items,
      pagination: {
        take,
        hasNext,
        nextCursor: hasNext ? items[items.length - 1]?.id : null,
        totalFiltered,
        totalAll,
      }
    }
  }
}
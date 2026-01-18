import type { Media } from "../generated/prisma/client.ts";
import { prismaClient } from "../database/db.ts";

const database = prismaClient.media

export class MediaService {
  static async QUERY_PRODUCT_GALLERY(productId?: string): Promise<Media[]> {
    return database.findMany({ where: { id: productId } });
  }
}
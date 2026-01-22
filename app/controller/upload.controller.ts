import type { NextFunction, Request, Response } from "express";
import { uploadToCloudinary } from "../helper/cloudinary-upload.helper.ts";
import { prismaClient } from "../database/db.ts";
import { SuccessReponse } from "../response/success.response.ts";

export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const image = await uploadToCloudinary(req.file.buffer, "single");

    const response = await prismaClient.media.create({
      data: {
        publicId: image.publicId,
        url: image.url,
      },
      select: {
        id: true,
        url: true,
        publicId: true,
      }
    })
    return res.status(200).json({...SuccessReponse.POST_ITEM, result: {item:  response, pagination: null}});
  } catch (e) {
    console.error({e})
    next(e);
  }
};

export const uploadMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: "Images required" });
    }
    const uploads = req.files.map((file) =>
      uploadToCloudinary(file.buffer, "multiple")
    );
    const images = await Promise.all(uploads);
    const response = await prismaClient.media.createMany({
      data: images,
      skipDuplicates: true,
    })
    return res.status(200).json({...SuccessReponse.POST_ITEM, result: {items:  response, pagination: null}});
  } catch (e) {
    next(e);
  }
};

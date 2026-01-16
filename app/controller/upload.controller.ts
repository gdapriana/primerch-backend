import type { Request, Response } from "express";
import { uploadToCloudinary } from "../helper/cloudinary-upload.helper.ts";

export const uploadSingleImage = async (
  req: Request,
  res: Response
) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image required" });
  }

  const image = await uploadToCloudinary(req.file.buffer, "single");

  return res.json({
    success: true,
    image,
  });
};

export const uploadMultipleImages = async (
  req: Request,
  res: Response
) => {
  if (!req.files || !Array.isArray(req.files)) {
    return res.status(400).json({ message: "Images required" });
  }

  const uploads = req.files.map((file) =>
    uploadToCloudinary(file.buffer, "multiple")
  );

  const images = await Promise.all(uploads);

  return res.json({
    success: true,
    images,
  });
};

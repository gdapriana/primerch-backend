import { Router } from "express";
import upload from "../middleware/multer.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import {
  uploadSingleImage,
  uploadMultipleImages,
} from "../controller/upload.controller";
import { userMiddleware } from "../middleware/user.middleware.ts";

const uploadRouter = Router();
uploadRouter.post(
  "/single",
  userMiddleware,
  adminMiddleware,
  upload.single("image"),
  uploadSingleImage
);
uploadRouter.post(
  "/multiple",
  userMiddleware,
  adminMiddleware,
  upload.array("images", 10),
  uploadMultipleImages
);

export default uploadRouter;

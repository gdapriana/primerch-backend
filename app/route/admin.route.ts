import express from "express";
import { adminMiddleware } from "../middleware/admin.middleware.ts";
import { ProductController } from "../controller/product.controller.ts";

const adminRoute = express.Router();
adminRoute.use(adminMiddleware);

adminRoute.post("/products", ProductController.POST);

export default adminRoute;
import express from "express";
import { adminMiddleware } from "../middleware/admin.middleware.ts";
import { ProductController } from "../controller/product.controller.ts";
import { MediaController } from "../controller/media.controller.ts";
import { VariantController } from "../controller/variant.controller.ts";
import { OrderController } from "../controller/order.controller.ts";
import { CategoryAdminController, CategoryController } from "../controller/category.controller.ts";

const adminRoute = express.Router();
adminRoute.use(adminMiddleware);

adminRoute.post("/products", ProductController.POST);
adminRoute.get('/products/:productId/gallery', MediaController.QUERY_PRODUCT_GALLERY);
adminRoute.get('/variants', VariantController.QUERY);
adminRoute.get('/orders', OrderController.QUERY);
adminRoute.get('/orders', OrderController.QUERY);
adminRoute.patch('/orders/:orderId/status', OrderController.UPDATE_ORDER_STATUS);



adminRoute.get('/categories/:categoryId/cover', CategoryAdminController.GET_COVER);

export default adminRoute;
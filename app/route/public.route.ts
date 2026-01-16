import express from "express";

import {
  ProductController,
  ProductHelperController,
} from "../controller/product.controller";
import { UserController } from "../controller/user.controller";
import { LikeController } from "../controller/like.controller";
import { BookmarkController } from "../controller/bookmark.controller";
import { ReviewController } from "../controller/review.controller";
import { CategoryController } from "../controller/category.controller";

const publicRoute = express.Router();

publicRoute.post("/register", UserController.REGISTER);
publicRoute.post("/login", UserController.LOGIN);
publicRoute.get("/refresh-token", UserController.REFRESH);

publicRoute.get("/products", ProductController.QUERY);
publicRoute.get("/products/get", ProductController.GET);
publicRoute.post("/products/stock", ProductHelperController.STOCK);

publicRoute.get("/categories", CategoryController.QUERY);
publicRoute.get("/categories/get", CategoryController.GET);

publicRoute.get("/products/:productId/like-count", LikeController.COUNT_ALL);
publicRoute.get(
  "/products/:productId/bookmark-count",
  BookmarkController.COUNT_ALL
);

publicRoute.get("/products/:productId/reviews", ReviewController.QUERY);
publicRoute.get("/products/:productId/total-reviews", ReviewController.TOTAL);

export default publicRoute;

import express from "express";
import { userMiddleware } from "../middleware/user.middleware";
import { CartController } from "../controller/cart.controller";
import { UserController } from "../controller/user.controller";
import { OrderController } from "../controller/order.controller";
import { LikeController } from "../controller/like.controller";
import { BookmarkController } from "../controller/bookmark.controller";
import { ReviewController } from "../controller/review.controller";

const userRoute = express.Router();
userRoute.use(userMiddleware);

userRoute.get("/me", UserController.ME);

userRoute.get("/cart", CartController.GET);
userRoute.patch(
  "/product-in-cart/:productInCartId/quantity/inc",
  CartController.PATCH_INC_QUANTITY
);
userRoute.post("/product-in-cart", CartController.ADD_PRODUCT);
userRoute.patch(
  "/product-in-cart/:productInCartId/quantity/dec",
  CartController.PATCH_DEC_QUANTITY
);
userRoute.delete(
  "/product-in-cart/:productInCartId",
  CartController.DELETE_PRODUCT
);

userRoute.get("/orders/:orderId", OrderController.GET_USER_ORDER_DETAILS);
userRoute.get("/orders", OrderController.GET_USER_ORDER);
userRoute.get("/order-information", OrderController.GET_ORDER_INFORMATION);
userRoute.post("/orders", OrderController.CREATE_ORDER);

userRoute.get("/products/:productId/liked-check", LikeController.CHECK);
userRoute.post("/products/:productId/like-toggle", LikeController.TOGGLE);
userRoute.get("/liked", LikeController.QUERY);

userRoute.get(
  "/products/:productId/bookmarked-check",
  BookmarkController.CHECK
);
userRoute.post(
  "/products/:productId/bookmark-toggle",
  BookmarkController.TOGGLE
);
userRoute.get("/bookmarked", BookmarkController.QUERY);

userRoute.post("/products/:productId/review", ReviewController.CREATE);
userRoute.get(
  "/products/:productId/check-review",
  ReviewController.CHECK_IS_REVIEWED
);

export default userRoute;

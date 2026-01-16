import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import publicRoute from "./route/public.route";
import { errorMiddleware } from "./middleware/error.middleware.ts";
import userRoute from "./route/user.route.ts";
import { ResponseError } from "./response/error.response.ts";
import adminRoute from "./route/admin.route.ts";
import uploadRouter from "./route/upload.route.ts";

export const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
app.use(publicRoute);
app.use(userRoute);
app.use(uploadRouter);
app.use(adminRoute);

app.use((req, res, next) => {
  const error = new ResponseError({
    status: 500,
    message: "routing not found",
  });
  next(error);
});

app.use(errorMiddleware);

import { Express } from "express";
import { authRouter } from "./src/auth";
import { searchRouter } from "./src/search";
import { profileRouter } from "./src/profile";
import { reviewRouter } from "./src/review";
import { courseRouter } from "./src/course";
import { adminRouter } from "./src/admin";
import aiRouter from "./src/ai/routes"

export const configure = (app: Express) => {
  app.use(
    "/api",
    authRouter,
    searchRouter,
    profileRouter,
    reviewRouter,
    courseRouter,
    adminRouter,
  );

  app.use('/ai', aiRouter)
};
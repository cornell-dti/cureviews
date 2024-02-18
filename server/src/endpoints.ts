import { Express } from "express";
import { authRouter } from "./auth/index.js";
import { searchRouter } from "./search/index.js";
import { profileRouter } from "./profile/index.js";
import { reviewRouter } from "./review/index.js";
import { courseRouter } from "./course/index.js";
import { adminRouter } from "./admin/index.js";

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
};

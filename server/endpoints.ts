import { Express } from 'express';
import authRouter from './src/auth/auth.router';
import searchRouter from './src/search/search.router';
import profileRouter from './src/profile/profile.router';
import reviewRouter from './src/review/review.router';
import courseRouter from './src/course/course.router';
import adminRouter from './src/admin/admin.router';

export const configure = (app: Express) => {
  app.use(
    '/api',
    authRouter,
    searchRouter,
    profileRouter,
    reviewRouter,
    courseRouter,
    adminRouter,
  );
};

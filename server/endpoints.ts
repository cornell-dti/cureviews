import { Express } from 'express';
import { authRouter } from './src/auth';
import { searchRouter } from './src/search';
import { profileRouter } from './src/profile';
import { reviewRouter } from './src/review';
import { courseRouter } from './src/course';
import { adminRouter } from './src/admin';
import aiRouter from './src/ai/ai.router';

export const configure = (app: Express) => {
  app.use('/api/admin', adminRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/profiles', profileRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/ai', aiRouter);
};

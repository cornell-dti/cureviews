import express from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import {
  totalReviews,
  howManyReviewsEachClass,
  howManyEachClass,
  topSubjects,
  getReviewsOverTimeTop15,
} from './src/admin/AdminChart';
import {
  getReviewsByCourseId,
  getCourseById,
  insertReview,
  insertUser,
  getCourseByInfo,
  updateLiked,
  userHasLiked,
} from './src/review/review';
import {
  countReviewsByStudentId,
  getTotalLikesByStudentId,
  getReviewsByStudentId,
  getStudentEmailByToken,
} from './src/profile/profile';
import { tokenIsAdmin } from './src/auth/auth';
import {
  getCoursesByProfessor,
  getCoursesByMajor,
  getClassesByQuery,
  getSubjectsByQuery,
  getProfessorsByQuery,
} from './src/search/search';
import {
  fetchReviewableClasses,
  reportReview,
  makeReviewVisible,
  undoReportReview,
  removeReview,
  getRaffleWinner,
} from './src/admin/admin';
import authRouter from './src/auth/auth.router';

export interface Context {
  ip: string;
}

// A type which captures an endpoint, and the guard for that endpoint
// INVARIANT: If an object passes the guard, it can be coerced into type T
export interface Endpoint<T> {
  guard: ValidationChain[];
  // TODO: this is needed for backwards compatibility with many of the methods
  // This is bad in the long run. Please fix.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (ctx: Context, args: T) => any;
}

/*
 * Configure the various endpoints to use
 */
export function configure(app: express.Application) {
  app.use(express.json());
  // needed to get client IP apparently
  app.set('trust proxy', true);
  app.use('/auth', authRouter);

  // register(app, 'getClassesByQuery', getClassesByQuery);
  // register(app, 'getReviewsByCourseId', getReviewsByCourseId);
  // register(app, 'getCourseById', getCourseById);
  // register(app, 'tokenIsAdmin', tokenIsAdmin);
  // register(app, 'getSubjectsByQuery', getSubjectsByQuery);
  // register(app, 'getCoursesByMajor', getCoursesByMajor);
  // register(app, 'getProfessorsByQuery', getProfessorsByQuery);
  // register(app, 'getCoursesByProfessor', getCoursesByProfessor);
  // register(app, 'insertReview', insertReview);
  // register(app, 'insertUser', insertUser);
  // register(app, 'makeReviewVisible', makeReviewVisible);
  // register(app, 'fetchReviewableClasses', fetchReviewableClasses);
  // register(app, 'undoReportReview', undoReportReview);
  // register(app, 'reportReview', reportReview);
  // register(app, 'removeReview', removeReview);
  // register(app, 'getCourseByInfo', getCourseByInfo);
  // register(app, 'totalReviews', totalReviews);
  // register(app, 'howManyReviewsEachClass', howManyReviewsEachClass);
  // register(app, 'howManyEachClass', howManyEachClass);
  // register(app, 'topSubjects', topSubjects);
  // register(app, 'getReviewsOverTimeTop15', getReviewsOverTimeTop15);
  // register(app, 'updateLiked', updateLiked);
  // register(app, 'userHasLiked', userHasLiked);
  // register(app, 'getTotalLikesByStudentId', getTotalLikesByStudentId);
  // register(app, 'getReviewsByStudentId', getReviewsByStudentId);
  // register(app, 'countReviewsByStudentId', countReviewsByStudentId);
  // register(app, 'getStudentEmailByToken', getStudentEmailByToken);
  // register(app, 'getRaffleWinner', getRaffleWinner);
}

function register<T>(
  app: express.Application,
  name: string,
  endpoint: Endpoint<T>,
) {
  const { callback, guard } = endpoint;
  app.post(`/api/${name}`, guard, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // INVARIANT:
    // The fact that the guard has not errored is enough for this to be safe
    // Make sure that your guard is sufficient!
    const arg = req.body;
    const ctx = { ip: req.ip };
    return res.status(200).send({ result: await callback(ctx, arg) });
  });
}

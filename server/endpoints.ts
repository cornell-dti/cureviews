import express from "express";
import { validationResult, ValidationChain } from "express-validator";
import { totalReviews, howManyReviewsEachClass, howManyEachClass, topSubjects, getReviewsOverTimeTop15 } from "./endpoints/AdminChart";
import { getReviewsByCourseId, getCourseById, insertReview, insertUser, getCourseByInfo, incrementLike, decrementLike } from "./endpoints/Review";
import { tokenIsAdmin } from "./endpoints/Auth";
import { getCoursesByProfessor, getCoursesByMajor, getClassesByQuery, getSubjectsByQuery, getProfessorsByQuery } from "./endpoints/Search";
import { fetchReviewableClasses, reportReview, makeReviewVisible, undoReportReview, removeReview, getRaffleWinner } from "./endpoints/AdminActions";

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
  const methods = express.Router();
  methods.use(express.json());
  app.use(express.json());
  // needed to get client IP apparently
  app.set('trust proxy', true);

  register(app, "getClassesByQuery", getClassesByQuery);
  register(app, "getReviewsByCourseId", getReviewsByCourseId);
  register(app, "getCourseById", getCourseById);
  register(app, "tokenIsAdmin", tokenIsAdmin);
  register(app, "getSubjectsByQuery", getSubjectsByQuery);
  register(app, "getCoursesByMajor", getCoursesByMajor);
  register(app, "getProfessorsByQuery", getProfessorsByQuery);
  register(app, "getCoursesByProfessor", getCoursesByProfessor);
  register(app, "insertReview", insertReview);
  register(app, "insertUser", insertUser);
  register(app, "makeReviewVisible", makeReviewVisible);
  register(app, "fetchReviewableClasses", fetchReviewableClasses);
  register(app, "undoReportReview", undoReportReview);
  register(app, "reportReview", reportReview);
  register(app, "removeReview", removeReview);
  register(app, "getCourseByInfo", getCourseByInfo);
  register(app, "totalReviews", totalReviews);
  register(app, "howManyReviewsEachClass", howManyReviewsEachClass);
  register(app, "howManyEachClass", howManyEachClass);
  register(app, "topSubjects", topSubjects);
  register(app, "getReviewsOverTimeTop15", getReviewsOverTimeTop15);
  register(app, "incrementLike", incrementLike);
  register(app, "decrementLike", decrementLike);
  register(app, "getRaffleWinner", getRaffleWinner);
}

function register<T>(app: express.Application, name: string, endpoint: Endpoint<T>) {
  const { callback, guard } = endpoint;
  app.post(`/v2/${name}`, guard, async (req, res) => {
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

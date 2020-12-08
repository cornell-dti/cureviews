import express from "express";
import { validationResult, ValidationChain } from "express-validator";
import { getReviewsByCourseId, getCourseById, insertReview, insertUser, getCourseByInfo } from "./endpoints/Review";
import { totalReviews, howManyReviewsEachClass, howManyEachClass, topSubjects } from "./endpoints/AdminChart";
import { tokenIsAdmin } from "./endpoints/Auth";
import { getClassesByQuery, getSubjectsByQuery, getProfessorsByQuery } from "./endpoints/Search";
import { makeReviewVisible, undoReportReview, removeReview } from "./endpoints/AdminActions";

// A type which captures an endpoint, and the guard for that endpoint
// INVARIANT: If an object passes the guard, it can be coerced into type T
export interface Endpoint<T> {
  guard: ValidationChain[];
  callback: (args?: T) => any;
}

/*
 * Configure the various endpoints to use
 */
export function configure(app: express.Application) {
  const methods = express.Router();
  methods.use(express.json());
  app.use(express.json());

  register(app, "getClassesByQuery", getClassesByQuery);
  register(app, "getReviewsByCourseId", getReviewsByCourseId);
  register(app, "getCourseById", getCourseById);
  register(app, "tokenIsAdmin", tokenIsAdmin);
  register(app, "getSubjectsByQuery", getSubjectsByQuery);
  register(app, "getProfessorsByQuery", getProfessorsByQuery);
  register(app, "insertReview", insertReview);
  register(app, "insertUser", insertUser);
  register(app, "makeReviewVisible", makeReviewVisible);
  register(app, "undoReportReview", undoReportReview);
  register(app, "removeReview", removeReview);
  register(app, "getCourseByInfo", getCourseByInfo);
  register(app, "totalReviews", totalReviews);
  register(app, "howManyReviewsEachClass", howManyReviewsEachClass);
  register(app, "howManyEachClass", howManyEachClass);
  register(app, "topSubjects", topSubjects);
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

    return res.status(200).send({ result: await callback(arg) });
  });
}

import { body } from "express-validator";

import { getCrossListOR, getMetricValues } from "common/CourseCard";
import { Context, Endpoint } from "../endpoints";
import { Reviews, ReviewDocument, Classes, Students } from "../dbDefs";
import {
  updateProfessors,
  findAllSemesters,
  resetProfessorArray,
} from "../dbInit";
import { getCourseById, verifyToken } from "./utils";
import { ReviewRequest } from "./Review";

// The type for a request with an admin action for a review
interface AdminReviewRequest {
  review: ReviewDocument;
  token: string;
}

// The type for a request with an admin action for updating professors info
interface AdminProfessorsRequest {
  token: string;
}

interface AdminRaffleWinnerRequest {
  token: string;
  startDate: string;
}

// This updates the metrics for an individual class given its Mongo-generated id.
// Returns 1 if successful, 0 otherwise.
export const updateCourseMetrics = async (courseId) => {
  try {
    const course = await getCourseById({ courseId });
    if (course) {
      const crossListOR = getCrossListOR(course);
      const reviews = await Reviews.find(
        { visible: 1, reported: 0, $or: crossListOR },
        {},
        { sort: { date: -1 }, limit: 700 },
      ).exec();
      const state = getMetricValues(reviews);
      await Classes.updateOne(
        { _id: courseId },
        {
          $set: {
            // If no data is available, getMetricValues returns "-" for metric
            classDifficulty:
              state.diff !== "-" && !isNaN(Number(state.diff))
                ? Number(state.diff)
                : null,
            classRating:
              state.rating !== "-" && !isNaN(Number(state.rating))
                ? Number(state.rating)
                : null,
            classWorkload:
              state.workload !== "-" && !isNaN(Number(state.workload))
                ? Number(state.workload)
                : null,
          },
        },
      );
      return { resCode: 1 };
    }

    // eslint-disable-next-line no-console
    console.log(`updateCourseMetrics unable to find id ${courseId}`);
    return { resCode: 0 };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'updateCourseMetrics' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return { resCode: 0 };
  }
};

/*
 * Approve a submitted review and make it visible
 */
export const makeReviewVisible: Endpoint<AdminReviewRequest> = {
  guard: [body("review").notEmpty(), body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, adminReviewRequest: AdminReviewRequest) => {
    try {
      // check: make sure review id is valid and non-malicious
      const userIsAdmin = await verifyToken(adminReviewRequest.token);
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(adminReviewRequest.review._id) && userIsAdmin) {
        await Reviews.updateOne(
          { _id: adminReviewRequest.review._id },
          { $set: { visible: 1 } },
        );
        await updateCourseMetrics(adminReviewRequest.review.class);

        return { resCode: 1 };
      }

      return { resCode: 0 };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'makeVisible' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

/*
 * "Undo" the reporting of a flagged review and make it visible again
 */
export const undoReportReview: Endpoint<AdminReviewRequest> = {
  guard: [
    body("review").notEmpty(),
    body("token").notEmpty().isAscii(),
    body("review._id").isAscii(),
  ],
  callback: async (ctx: Context, adminReviewRequest: AdminReviewRequest) => {
    try {
      const userIsAdmin = await verifyToken(adminReviewRequest.token);
      if (userIsAdmin) {
        await Reviews.updateOne(
          { _id: adminReviewRequest.review._id },
          { $set: { visible: 1, reported: 0 } },
        );
        await updateCourseMetrics(adminReviewRequest.review.class);
        return { resCode: 1 };
      }
      return { resCode: 0 };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'undoReportReview' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

/*
 * Remove a review, used for both submitted and flagged reviews
 */
export const removeReview: Endpoint<AdminReviewRequest> = {
  guard: [
    body("review").notEmpty(),
    body("token").notEmpty().isAscii(),
    body("review._id").isAscii(),
  ],
  callback: async (ctx: Context, adminReviewRequest: AdminReviewRequest) => {
    try {
      const userIsAdmin = await verifyToken(adminReviewRequest.token);
      if (userIsAdmin) {
        await Reviews.remove({ _id: adminReviewRequest.review._id });
        const res = await updateCourseMetrics(adminReviewRequest.review.class);
        return { resCode: res.resCode };
      }
      return { resCode: 0 };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'removeReview' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

/*
 * Update the database so we have the professors information
 */
export const setProfessors: Endpoint<AdminProfessorsRequest> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (
    ctx: Context,
    adminProfessorsRequest: AdminProfessorsRequest,
  ) => {
    try {
      const userIsAdmin = await verifyToken(adminProfessorsRequest.token);
      if (userIsAdmin) {
        const semesters = await findAllSemesters();
        const val = await updateProfessors(semesters);
        if (val) {
          return { resCode: val };
        }
        return { resCode: 1 };
      }
      return { resCode: 1 };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'setProfessors' ");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 1 };
    }
  },
};

/*
 * Initializes the classProfessors field in the Classes collection to an empty array so that
  we have a uniform empty array to fill with updateProfessors
 */
export const resetProfessors: Endpoint<AdminProfessorsRequest> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (
    ctx: Context,
    adminProfessorsRequest: AdminProfessorsRequest,
  ) => {
    try {
      const userIsAdmin = await verifyToken(adminProfessorsRequest.token);
      if (userIsAdmin) {
        const semesters = findAllSemesters();
        const val = await resetProfessorArray(semesters);
        if (val) {
          return { resCode: val };
        }
        return { resCode: 0 };
      }
      return { resCode: 0 };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'resetProfessors' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

export const reportReview: Endpoint<ReviewRequest> = {
  guard: [body("id").notEmpty().isAscii()],
  callback: async (ctx: Context, request: ReviewRequest) => {
    try {
      await Reviews.updateOne(
        { _id: request.id },
        { $set: { visible: 0, reported: 1 } },
      );
      const course = (await Reviews.findOne({ _id: request.id })).class;
      const res = await updateCourseMetrics(course);
      return { resCode: res.resCode };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'reportReview' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

export const fetchReviewableClasses: Endpoint<AdminProfessorsRequest> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: AdminProfessorsRequest) => {
    try {
      const userIsAdmin = await verifyToken(request.token);
      if (userIsAdmin) {
        return Reviews.find(
          { visible: 0 },
          {},
          { sort: { date: -1 }, limit: 700 },
        );
      }
      return { resCode: 0 };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'fetchReviewableClasses' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

export const getRaffleWinner: Endpoint<AdminRaffleWinnerRequest> = {
  guard: [body("token").notEmpty().isAscii(), body("startDate").notEmpty()],
  callback: async (ctx: Context, request: AdminRaffleWinnerRequest) => {
    try {
      const startDate = new Date(request.startDate);
      const winner = await Reviews.aggregate([
        { $match: { date: { $gte: startDate } } },
        { $sample: { size: 1 } },
      ]);

      if (winner.length <= 0) {
        return { resCode: 0, netId: "No Reviews to Choose From" };
      }

      const studentId = winner[0].user;
      const user = await Students.findOne({ _id: studentId });
      const { netId } = user;

      return { resCode: 0, netId };
    } catch (error) {
      console.log(error);
      return { resCode: 1 };
    }
  },
};

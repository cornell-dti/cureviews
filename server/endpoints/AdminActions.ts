import { body } from "express-validator";

import { Endpoint } from "../endpoints";
import { Reviews, ReviewDocument, Classes } from "../dbDefs";
import {verifyToken } from "./Auth";
import { getCrossListOR, getMetricValues } from "../../common/CourseCard";

// The type for a request with an admin action for a review
interface AdminReviewRequest {
    review: ReviewDocument;
    token: string;
}

// This updates the metrics for an individual class given its Mongo-generated id.
// Returns 1 if successful, 0 otherwise.
export const updateCourseMetrics = async (courseId, token) => {
  try {
    const userIsAdmin = await verifyToken(token);
    if (userIsAdmin) {
      const course = await Meteor.call("getCourseById", courseId);
      if (course) {
        const crossListOR = getCrossListOR(course);
        const reviews = await Reviews.find({ visible: 1, reported: 0, $or: crossListOR }, {}, { sort: { date: -1 }, limit: 700 }).exec();
        const state = getMetricValues(reviews);

        await Classes.updateOne({ _id: courseId },
          {
            $set: {
            // If no data is available, getMetricValues returns "-" for metric
              classDifficulty: (state.diff !== "-" && !isNaN(Number(state.diff)) ? Number(state.diff) : null),
              classRating: (state.rating !== "-" && !isNaN(Number(state.rating)) ? Number(state.rating) : null),
              classWorkload: (state.workload !== "-" && !isNaN(Number(state.workload)) ? Number(state.workload) : null),
            },
          });
        return 1;
      }
      return 0;
    }
    return 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'updateCourseMetrics' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return 0;
  }
};

/*
 * Approve a submitted review and make it visible
 */
export const makeReviewVisible: Endpoint<AdminReviewRequest> = {
  guard: [body("review").notEmpty(), body("token").notEmpty().isAscii()],
  callback: async (adminReviewRequest: AdminReviewRequest) => {
    try {
      // check: make sure review id is valid and non-malicious
      const userIsAdmin = await verifyToken(adminReviewRequest.token);
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(adminReviewRequest.review._id) && userIsAdmin) {
        await Reviews.updateOne({ _id: adminReviewRequest.review._id }, { $set: { visible: 1 } });
        await updateCourseMetrics(adminReviewRequest.review.class, adminReviewRequest.token);
        return 1;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'makeVisible' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return 0;
    }
  },
};

/*
 * "Undo" the reporting of a flagged review and make it visible again
 */
export const undoReportReview: Endpoint<AdminReviewRequest> = {
  guard: [body("review").notEmpty(), body("token").notEmpty().isAscii()],
  callback: async (adminReviewRequest: AdminReviewRequest) => {
    try {
      const userIsAdmin = await verifyToken(adminReviewRequest.token);
      // check: make sure review id is valid and non-malicious
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(adminReviewRequest.review._id) && userIsAdmin) {
        await Reviews.updateOne({ _id: adminReviewRequest.review._id }, { $set: { visible: 1, reported: 0 } });
        return 1;
      }
      return 0;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'undoReportReview' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return 0;
    }
  },
};

/*
 * Remove a review, used for both submitted and flagged reviews
 */
export const removeReview: Endpoint<AdminReviewRequest> = {
  guard: [body("review").notEmpty(), body("token").notEmpty().isAscii()],
  callback: async (adminReviewRequest: AdminReviewRequest) => {
    try {
      // check: make sure review id is valid and non-malicious
      const userIsAdmin = await verifyToken(adminReviewRequest.token);
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(adminReviewRequest.review._id) && userIsAdmin) {
        await Reviews.remove({ _id: adminReviewRequest.review._id });
        await updateCourseMetrics(adminReviewRequest.review.class, adminReviewRequest.token);
        return 1;
      }
      return 0;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'removeReview' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return 0;
    }
  },
};

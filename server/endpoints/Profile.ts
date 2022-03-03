import { body } from "express-validator";
import { Context, Endpoint } from "../endpoints";
import { ReviewDocument, Reviews, Students, Classes } from "../dbDefs";

// The type of a query with a studentId
export interface NetIdQuery {
  netId: string;
}

/**
 * Counts the number of reviews made by a given student id.
 */
export const countReviewsByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    try {
      const student = await Students.findOne({ netId });
      if (student.reviews == null) {
        return { code: 500, message: "No reviews object were associated." };
      }

      return { code: 200, message: student.reviews.length };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'countReviewsByStudentId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { code: 500, message: error.message };
    }
  },
};

/**
 * [getTotalLikesByStudentId] returns the total number of likes a student has gotten on their reviews
 */
export const getTotalLikesByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    let totalLikes = 0;
    try {
      const reviews = await getreviewIDsByStudentID(netId);
      reviews.forEach((review) => {
        if ('likes' in review) {
          totalLikes += review.likes;
        }
      });

      return { code: 200, message: totalLikes };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getTotalLikesByStudentId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { code: 500, message: error.message };
    }
  },
};

/**
 * [getReviewsByStudentId] returns a list of review objects that are created by the given student's netID
 */
export const getReviewsByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    try {
      const reviews = await getreviewIDsByStudentID(netId);
      return { code: 200, message: reviews };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getReviewsByStudentId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { code: 500, message: error.message };
    }
  },
};

async function getreviewIDsByStudentID(netId: string) {
  const studentDoc = await Students.findOne({ netId });
  const reviewIds = studentDoc.reviews;
  const reviews: ReviewDocument[] = await Promise.all(
    (reviewIds).map(async (reviewId) => {
      return await Reviews.findOne({ _id: reviewId });
    }),
  );
  return reviews;
}

import { body } from "express-validator";
import { Reviews, Students } from "../dbDefs";
import { Context, Endpoint } from "../endpoints";

// The type of a query with a studentId
export interface NetIdQuery{
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
      Students.findOne({ netId })
        .then((student) => {
          Reviews.find({ user: student._id })
            .then((reviews) => reviews.length);
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'countReviewsByStudentId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return -1;
    }
  },
};

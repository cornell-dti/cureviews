import { body } from "express-validator";
import { Students } from "../dbDefs";
import { Context, Endpoint } from "../endpoints";

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

export const getReviewsByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    try {
      const student = await Students.findOne({ netId });
      if (student.reviews == null) {
        return { code: 500, message: "No reviews object were associated." };
      }

      return { code: 200, message: student.reviews };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getReviewsByStudentId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { code: 500, message: error.message };
    }
  },
};

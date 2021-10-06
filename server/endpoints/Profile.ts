import { body } from "express-validator";
import { Reviews } from "../dbDefs";
import { Context, Endpoint } from "../endpoints";

// The type of a query with a studentId
export interface StudentIdQuery{
  studentId: string;
}

/**
 * Counts the number of reviews made by a given student id.
 */

export const countReviewsByStudentId: Endpoint<StudentIdQuery> = {
  guard: [body("studentId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: StudentIdQuery) => {
    const { studentId } = request;
    try {
      return Reviews.count({ user: studentId });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'countReviewsByStudentId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return -1;
    }
  },
};

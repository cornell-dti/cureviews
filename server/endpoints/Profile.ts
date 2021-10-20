import { body } from "express-validator";
import { Review } from "common";
import { Context, Endpoint } from "../endpoints";
import { Reviews } from "../dbDefs";

// The type of a query with a studentId
export interface StudentIdQuery {
  studentId: string;
}

export const getTotalLikesByStudentId: Endpoint<StudentIdQuery> = {
  guard: [body("studentId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: StudentIdQuery) => {
    const { studentId } = request;
    let totalLikes = 0;
    try {
      (await Reviews.find({ user: studentId }).exec()).forEach((review) => { totalLikes += review.likes; });
      return { resCode: 1, totalLikes };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getTotalLikesByStudentId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

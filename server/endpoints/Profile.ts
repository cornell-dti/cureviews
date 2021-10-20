import { body } from "express-validator";
import { Context, Endpoint } from "../endpoints";
import { Reviews, Students } from "../dbDefs";

// The type of a query with a studentId
export interface NetIdQuery {
  netId: string;
}

export const getTotalLikesByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    let totalLikes = 0;
    try {
      await Students.findOne({ netId })
        .then(async (student) => {
          (await Reviews.find({ user: student._id })).forEach((review) => { totalLikes += review.likes; });
        });
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

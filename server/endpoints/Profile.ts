import { body } from "express-validator";
import { Context, Endpoint } from "../endpoints";
import { ReviewDocument, Reviews, Students } from "../dbDefs";

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
      const studentDoc = await Students.findOne({ netId });
      const reviewIds = studentDoc.reviews;
      const reviews: ReviewDocument[] = await Promise.all(
        (reviewIds).map(async (reviewId) => await Reviews.findOne({ _id: reviewId })),
      );
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

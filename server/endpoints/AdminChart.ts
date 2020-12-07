import { body } from "express-validator";
import { verifyToken } from "./utils";
import { Endpoint } from "../endpoints";
import { Reviews } from "../dbDefs";

// howManyEachClass
// howManyReviewsEachClass
// totalReviews
// getReviewsOverTimeTop15
interface TotalReviewsRequest {
  token: string;
}

// eslint-disable-next-line import/prefer-default-export
export const totalReviews: Endpoint<TotalReviewsRequest> = {
  // eslint-disable-next-line no-undef
  guard: [body("token").notEmpty().isAscii()],
  callback: async (request: TotalReviewsRequest) => {
    const { token } = request;
    try {
      const userIsAdmin = await verifyToken(token);
      if (userIsAdmin) {
        return Reviews.find({}).count();
      }
      return -1;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'totalReviews' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return -2;
    }
  },
};

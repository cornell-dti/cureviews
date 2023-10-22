import { body } from "express-validator";
import { Context, Endpoint } from "../endpoints";
import { ReviewDocument, Reviews, Students } from "../dbDefs";

import { getVerificationTicket } from "./Auth";

// The type of a query with a studentId
export interface NetIdQuery {
  netId: string;
}

// The type of a query with a token
export interface ProfileRequest {
  token: string;
}

/**
 * Returns true if [token] matches the email if the given token is valid and 
 * false otherwise
 * This method authenticates the user token through the Google API.
 * 
 * @param token: google authentication token that is checked to see if it is not
 * empty and an ASCII value
 * @requires that you have a handleVerifyError, like as follows:
 * verify(token, function(){//do whatever}).catch(function(error)){}
 * @returns: Endpoint with type ProfileRequest
 */
export const getStudentEmailByToken: Endpoint<ProfileRequest> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: ProfileRequest) => {
    const { token } = request;

    try {
      const ticket = await getVerificationTicket(token);
      if (ticket.hd === "cornell.edu") {
        return { code: 200, message: ticket.email };
      }

      return { code: 500, message: "Invalid email" };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getStudentEmailByToken' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { code: 500, message: error.message };
    }
  },
};

/**
 * Returns the number of reviews that match a given netId and null if there are none
 * This method counts the total number of reviews left by a student.
 * 
 * @param netId: netId that is checked to see if it is not empty and an ASCII value
 * @returns: Endpoint with type NetIdQuery
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
 * Returns the number of likes that match the reviewIds associated with a given 
 * netId and error if there are none
 * This method counts the total number of likes received by a student.
 * 
 * @param netId: netId that is checked to see if it is not empty and an ASCII value
 * @returns: Endpoint with type NetIdQuery
 */
export const getTotalLikesByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    let totalLikes = 0;
    try {
      const studentDoc = await Students.findOne({ netId });
      const reviewIds = studentDoc.reviews;
      let reviews: ReviewDocument[] = await Promise.all(
        reviewIds.map(
          async (reviewId) => await Reviews.findOne({ _id: reviewId }),
        ),
      );
      reviews = reviews.filter((review) => review !== null);
      reviews.forEach((review) => {
        if ("likes" in review) {
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
 * Returns the reviews that match the reviewIds associated with a given netId and
 * error if there are none
 * This method gets all of the reviews created by a student.
 * 
 * @param netId: netId that is checked to see if it is not empty and an ASCII value
 * @returns: Endpoint with type NetIdQuery
 */
export const getReviewsByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    try {
      const studentDoc = await Students.findOne({ netId });
      const reviewIds = studentDoc.reviews;
      if (reviewIds === null) {
        return { code: 200, message: [] };
      }
      let reviews: ReviewDocument[] = await Promise.all(
        reviewIds.map(
          async (reviewId) => await Reviews.findOne({ _id: reviewId }),
        ),
      );
      reviews = reviews.filter((review) => review !== null);
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

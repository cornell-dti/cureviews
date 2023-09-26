import { body } from "express-validator";
import { Context, Endpoint } from "../../../endpoints";
import { ReviewDocument, Reviews } from "../../../db/dbDefs";
import { ProfileRequest, NetIdQuery } from "./types";
import { getVerificationTicket } from "../../utils/utils";
import { getUserByNetId } from "../../dao/Student";
import { getReviewById } from "../../dao/Reviews";

export const getStudentEmailByToken: Endpoint<ProfileRequest> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: ProfileRequest) => {
    const { token } = request;

    try {
      const ticket = await getVerificationTicket(token);
      if (ticket === undefined || ticket === null) {
        return { code: 404, message: "Unable to verify token" };
      }
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
 * Counts the number of reviews made by a given student id.
 */
export const countReviewsByStudentId: Endpoint<NetIdQuery> = {
  guard: [body("netId").notEmpty().isAscii()],
  callback: async (ctx: Context, request: NetIdQuery) => {
    const { netId } = request;
    try {
      const student = await getUserByNetId(netId);
      if (student === null || student === undefined) {
        return { code: 404, message: "Unable to find student with netId: ", netId };
      }
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
      const studentDoc = await getUserByNetId(netId);
      if (studentDoc === null || studentDoc === undefined) {
        return {
          code: 404,
          message: "Unable to find student with netId: ",
          netId,
        };
      }
      const reviewIds = studentDoc.reviews;
      if (reviewIds == null) {
        return { code: 500, message: "No reviews object were associated." };
      }
      const results = await Promise.all(
        reviewIds.map(async (reviewId) => await getReviewById(reviewId)),
      );
      const reviews: ReviewDocument[] = results.filter((review) => review !== null);
      reviews.forEach((review) => {
        if ("likes" in review) {
          if (review.likes !== undefined) {
            totalLikes += review.likes;
          }
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
      const studentDoc = await getUserByNetId(netId);
      if (studentDoc === null || studentDoc === undefined) {
        return {
          code: 404,
          message: "Unable to find student with netId: ",
          netId,
        };
      }
      const reviewIds = studentDoc.reviews;
      if (reviewIds === null) {
        return { code: 200, message: [] };
      }
      const results = await Promise.all(
        reviewIds.map(
          async (reviewId) => await getReviewById(reviewId),
        ),
      );
      const reviews: ReviewDocument[] = results.filter((review) => review !== null && review !== undefined);
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

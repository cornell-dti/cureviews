import { body } from "express-validator";
import { getCrossListOR } from "common/CourseCard";
import { Review } from "common";
import { Context, Endpoint } from "../endpoints";
import { Classes, ReviewDocument, Reviews, Students } from "../dbDefs";
import { getCourseById as getCourseByIdCallback, insertUser as insertUserCallback, JSONNonempty } from "./utils";
import { getVerificationTicket } from "./Auth";

import shortid = require("shortid");

// The type of a query with a courseId
export interface CourseIdQuery {
  courseId: string;
}

interface InsertReviewRequest {
  token: string;
  review: Review;
  classId: string;
}

export interface InsertUserRequest {
  // TODO: one day, there may be types for this object. Today is not that day.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  googleObject: any;
}

// The type of a query with a course number and subject
interface ClassByInfoQuery {
  subject: string;
  number: string;
}

export interface ReviewRequest {
  id: string;
  token: string;
}

/**
 * Santize the reviews, so that we don't leak information about who posted what.
 * Even if the user id is leaked, however, that still gives no way of getting back to the netID.
 * Still, better safe than sorry.
 * @param lst the list of reviews to sanitize. Possibly a singleton list.
 * @returns a copy of the reviews, but with the user id field removed.
 */
export const sanitizeReviews = (lst: ReviewDocument[]) => (lst.map((doc) => {
  const copy = doc;
  copy.user = "";
  copy.likedBy = [];
  return copy;
}));

/**
 * Get a course with this course_id from the Classes collection
 */
export const getCourseById: Endpoint<CourseIdQuery> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: async (ctx: Context, arg: CourseIdQuery) => await getCourseByIdCallback(arg),
};

/*
 * Searches the database for a course matching the subject and course number. Used in class info retrieval.
 * See also: getCourseById above
 */
export const getCourseByInfo: Endpoint<ClassByInfoQuery> = {
  guard: [body("number").notEmpty().isNumeric(), body("subject").notEmpty().isAscii()],
  callback: async (ctx: Context, query: ClassByInfoQuery) => {
    try {
      return await Classes.findOne({ classSub: query.subject, classNum: query.number }).exec();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getCourseByInfo' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

/**
 * Get list of review objects for given class from class _id
 */
export const getReviewsByCourseId: Endpoint<CourseIdQuery> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: async (ctx: Context, courseId: CourseIdQuery) => {
    try {
      const course = await getCourseByIdCallback(courseId);
      if (course) {
        const crossListOR = getCrossListOR(course);
        const reviews = await Reviews.find({ visible: 1, reported: 0, $or: crossListOR }, {}, { sort: { date: -1 }, limit: 700 }).exec();
        return sanitizeReviews(reviews);
      }

      return { error: "Malformed Query" };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getReviewsByCourseId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

/**
 * Inserts a new user into the database, if the user was not already present
 *
 * Returns 1 if the user was added to the database, or was already present
 * Returns 0 if there was an error
 */
export const insertUser: Endpoint<InsertUserRequest> = {
  guard: [body("googleObject").notEmpty()],
  callback: async (ctx: Context, arg: InsertUserRequest) => await insertUserCallback(arg),
};

/**
 * Insert a new review into the database
 *
 * Returns 0 if there was an error
 * Returns 1 on a success
 */
export const insertReview: Endpoint<InsertReviewRequest> = {
  guard: [body("token").notEmpty().isAscii(), body("classId").notEmpty().isAscii()]
    .concat(JSONNonempty("review", ["text", "difficulty", "rating", "workload", "professors", "isCovid"])),
  callback: async (ctx: Context, request: InsertReviewRequest) => {
    try {
      const { token } = request;
      const { classId } = request;
      const { review } = request;
      const ticket = await getVerificationTicket(token);

      if (!ticket) return { resCode: 0, error: "Missing verification ticket" };

      if (ticket.hd === "cornell.edu") {
        // insert the user into the collection if not already present

        await insertUserCallback({ googleObject: ticket });

        const netId = ticket.email.replace("@cornell.edu", "");
        const student = (await Students.findOne({ netId }));

        const related = await Reviews.find({ class: classId });
        if (related.find((v) => v.text === review.text)) {
          return { resCode: 1, error: "Review is a duplicate of an already existing review for this class!" };
        }

        try {
          // Attempt to insert the review
          const fullReview = new Reviews({
            _id: shortid.generate(),
            text: review.text,
            difficulty: review.difficulty,
            rating: review.rating,
            workload: review.workload,
            class: classId,
            date: new Date(),
            visible: 0,
            reported: 0,
            professors: review.professors,
            likes: 0,
            isCovid: review.isCovid,
            user: student._id,
            selectedGrade: review.selectedGrade,
            selectedMajors: review.selectedMajors,
          });
          await fullReview.save();

          const newReviews = student.reviews ? student.reviews.concat([fullReview._id]) : [fullReview._id];
          await Students.updateOne({ netId }, { $set: { reviews: newReviews } }).exec();

          return { resCode: 1, errMsg: "" };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
          return { resCode: 0, error: "Unexpected error when adding review" };
        }
      } else {
        // eslint-disable-next-line no-console
        console.log("Error: non-Cornell email attempted to insert review");
        return { resCode: 0, error: "Error: non-Cornell email attempted to insert review" };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'insert' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0, error: "Error: at 'insert' method" };
    }
  },
};

/**
 * Increment the number of likes a review has gotten by 1.
 *
 * Returns resCode 1 on success
 * Returns resCode 0 on error
 *
 * TODO: migrate to a proper account-based solution
 */
export const incrementLike: Endpoint<ReviewRequest> = {
  guard: [body("id").notEmpty().isAscii(), body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: ReviewRequest) => {
    const { token } = request;
    try {
      const review = await Reviews.findOne({ _id: request.id }).exec();

      const ticket = await getVerificationTicket(token);

      if (!ticket) return { resCode: 0, error: "Missing verification ticket" };

      if (ticket.hd === "cornell.edu") {
        await insertUserCallback({ googleObject: ticket });
        const netId = ticket.email.replace("@cornell.edu", "");
        const student = (await Students.findOne({ netId }));

        if (student.likedReviews !== undefined && student.likedReviews.includes(review.id)) {
          return { resCode: 0, error: "Error: user already liked" };
        }

        // if likedReviews is undefined its fine. $push creates empty arr
        await Students.updateOne({ netId: student.netId }, { $push: { likedReviews: review.id } });

        if (review.likes === undefined) {
          await Reviews.updateOne({ _id: request.id }, { $set: { likes: 1 }, $push: { likedBy: student.id } }).exec();
        } else {
          await Reviews.updateOne({ _id: request.id }, { $set: { likes: review.likes + 1 }, $push: { likedBy: student.id } }).exec();
        }

        return { resCode: 1 };
      }
      return { resCode: 0, error: "Error: non-Cornell email attempted to insert review" };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'incrementLike' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

/**
 * Decrement the number of likes a review has gotten by 1.
 *
 * Returns resCode 1 on success
 * Returns resCole 0 on error
 */

export const decrementLike: Endpoint<ReviewRequest> = {
  guard: [body("id").notEmpty().isAscii(), body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: ReviewRequest) => {
    const { token } = request;
    try {
      const review = await Reviews.findOne({ _id: request.id }).exec();
      const ticket = await getVerificationTicket(token);

      if (!ticket) return { resCode: 0, error: "Missing verification ticket" };

      if (ticket.hd !== "cornell.edu") return { resCode: 0, error: "Error: non-Cornell email attempted to insert review" };

      await insertUserCallback({ googleObject: ticket });
      const netId = ticket.email.replace("@cornell.edu", "");
      const student = (await Students.findOne({ netId }));

      if (student.likedReviews === undefined || !student.likedReviews.includes(review.id)) {
        return { resCode: 0, error: "Error: user already disliked" };
      }

      await Students.updateOne({ netId }, { $pull: { likedReviews: review.id } });

      if (review.likes === undefined) {
        await Reviews.updateOne({ _id: request.id }, { $set: { likes: 0 } }, { $pull: { likedBy: student.netId } }).exec();
      } else {
        // bound the rating at 0
        await Reviews.updateOne({ _id: request.id },
          { $set: { likes: Math.max(0, review.likes - 1) } }, { $pull: { likedBy: student.netId } }).exec();
      }
      return { resCode: 1 };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'decrementLike' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 0 };
    }
  },
};

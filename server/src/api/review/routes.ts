import { body } from "express-validator";
import { getCrossListOR } from "common/CourseCard";
import shortid from "shortid";
import { Context, Endpoint } from "../../endpoints";
import { Reviews, Students } from "../../../db/dbDefs";
import {
  getVerificationTicket } from "../../utils/utils";
import {
  getCourseById as getCourseByIdCallback,
  getClassByInfo,
} from "../../data/Classes";
import { insertUser as insertUserCallback, JSONNonempty } from "./functions";
import {
  getReviewById,
  updateReviewLiked,
  sanitizeReview,
  getReviewsByCourse,
} from "../../data/Reviews";
import { CourseIdQuery, InsertReviewRequest, InsertUserRequest, ClassByInfoQuery, ReviewRequest } from "./types";


/**
 * Get a course with this course_id from the Classes collection
 */
export const getCourseById: Endpoint<CourseIdQuery> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: async (ctx: Context, arg: CourseIdQuery) => await getCourseByIdCallback(arg.courseId),
};

/*
 * Searches the database for a course matching the subject and course number. Used in class info retrieval.
 * See also: getCourseById above
 */
export const getCourseByInfo: Endpoint<ClassByInfoQuery> = {
  guard: [
    body("number").notEmpty().isNumeric(),
    body("subject").notEmpty().isAscii(),
  ],
  callback: async (ctx: Context, query: ClassByInfoQuery) => {
    try {
      return await getClassByInfo(query.subject, query.number);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getCourseByInfo' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { code: 500, message: "Internal Server Error" };
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
      const course = await getCourseByIdCallback(courseId.courseId);
      if (course) {
        const crossListOR = getCrossListOR(course);
        const reviews = await getReviewsByCourse(crossListOR);

        return { code: 200, message: reviews };
      }

      return { code: 400, message: "Malformed Query" };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getReviewsByCourseId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { code: 500, message: "Internal Server Error" };
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
  callback: async (ctx: Context, arg: InsertUserRequest) => {
    const result = await insertUserCallback(arg);
    if (result === 1) {
      return { code: 200, message: "User successfully added!" };
    }

    return { code: 500, message: "An error occurred while trying to insert a new user" };
  },
};

/**
 * Insert a new review into the database
 *
 * Returns 0 if there was an error
 * Returns 1 on a success
 */
export const insertReview: Endpoint<InsertReviewRequest> = {
  guard: [
    body("token").notEmpty().isAscii(),
    body("classId").notEmpty().isAscii(),
  ].concat(
    JSONNonempty("review", [
      "text",
      "difficulty",
      "rating",
      "workload",
      "professors",
      "isCovid",
    ]),
  ),
  callback: async (ctx: Context, request: InsertReviewRequest) => {
    try {
      const { token } = request;
      const { classId } = request;
      const { review } = request;

      const ticket = await getVerificationTicket(token);

      if (!ticket) return { resCode: 1, error: "Missing verification ticket" };

      if (ticket.hd === "cornell.edu") {
        // insert the user into the collection if not already present

        await insertUserCallback({ googleObject: ticket });

        const netId = ticket.email.replace("@cornell.edu", "");
        const student = await Students.findOne({ netId });

        const related = await Reviews.find({ class: classId });
        if (related.find((v) => v.text === review.text)) {
          return {
            code: 400,
            message:
              "Review is a duplicate of an already existing review for this class!",
          };
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
            grade: review.grade,
            major: review.major,
          });

          await fullReview.save();

          const newReviews = student.reviews
            ? student.reviews.concat([fullReview._id])
            : [fullReview._id];
          await Students.updateOne(
            { netId },
            { $set: { reviews: newReviews } },
          ).exec();

          return { resCode: 1, errMsg: "" };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
          return { resCode: 1, error: "Unexpected error when adding review" };
        }
      } else {
        // eslint-disable-next-line no-console
        console.log("Error: non-Cornell email attempted to insert review");
        return {
          resCode: 1,
          error: "Error: non-Cornell email attempted to insert review",
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'insert' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 1, error: "Error: at 'insert' method" };
    }
  },
};

/**
 * Updates a like on a review. If the student has already liked the review,
 * removes the like, and if the student has not, adds a like.
 */
export const updateLiked: Endpoint<ReviewRequest> = {
  guard: [body("id").notEmpty().isAscii(), body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: ReviewRequest) => {
    const { token } = request;
    try {
      let review = await getReviewById(request.id);

      const ticket = await getVerificationTicket(token);

      if (!ticket) return { resCode: 1, error: "Missing verification ticket" };

      if (ticket.hd === "cornell.edu") {
        await insertUserCallback({ googleObject: ticket });
        const netId = ticket.email.replace("@cornell.edu", "");
        const student = await Students.findOne({ netId });

        // removing like
        if (
          student.likedReviews !== undefined
          && student.likedReviews.includes(review.id)
        ) {
          await Students.updateOne(
            { netId },
            { $pull: { likedReviews: review.id } },
          );

          if (review.likes === undefined) {
            await updateReviewLiked(request.id, 0, student.netId);
          } else {
            // bound the rating at 0
            await updateReviewLiked(request.id, review.likes - 1, student.netId);
          }
        } else {
          // adding like
          await Students.updateOne(
            { netId: student.netId },
            { $push: { likedReviews: review.id } },
          );

          if (review.likes === undefined) {
            await Reviews.updateOne(
              { _id: request.id },
              { $set: { likes: 1 }, $push: { likedBy: student.id } },
            ).exec();
          } else {
            await Reviews.updateOne(
              { _id: request.id },
              {
                $set: { likes: review.likes + 1 },
                $push: { likedBy: student.id },
              },
            ).exec();
          }
        }

        review = await Reviews.findOne({ _id: request.id }).exec();

        return { resCode: 0, review: sanitizeReview(review) };
      }
      return {
        resCode: 1,
        error: "Error: non-Cornell email attempted to insert review",
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'incrementLike' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 1 };
    }
  },
};

export const userHasLiked: Endpoint<ReviewRequest> = {
  guard: [body("id").notEmpty().isAscii(), body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: ReviewRequest) => {
    const { token } = request;
    try {
      const review = await Reviews.findOne({ _id: request.id }).exec();
      const ticket = await getVerificationTicket(token);

      if (!ticket) return { resCode: 1, error: "Missing verification ticket" };

      if (ticket.hd !== "cornell.edu") {
        return {
          resCode: 1,
          error: "Error: non-Cornell email attempted to insert review",
        };
      }

      await insertUserCallback({ googleObject: ticket });
      const netId = ticket.email.replace("@cornell.edu", "");
      const student = await Students.findOne({ netId });

      if (student.likedReviews && student.likedReviews.includes(review.id)) {
        return { resCode: 0, hasLiked: true };
      }

      return { resCode: 0, hasLiked: false };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'decrementLike' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { resCode: 1 };
    }
  },
};

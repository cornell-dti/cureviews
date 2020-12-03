import { body, ValidationChain } from "express-validator";
import { getCrossListOR } from "common/CourseCard";
import { Review } from "common";
import { includesProfanity } from "common/profanity";
import { Endpoint } from "../endpoints";
import { Reviews, Students, ReviewDocument } from "../dbDefs";
import { getCourseById as getCourseByIdCallback, insertUser as insertUserCallback } from "./utils";
import { getVerificationTicket } from "./Auth";
import { Meteor } from "../shim";

import shortid = require("shortid");

export interface CourseId {
  courseId: string;
}

interface InsertRequest {
  token: string;
  review: ReviewDocument;
  classId: string;
}

export interface InsertUserRequest {
  googleObject: any;
}


/**
 * Get a course with this course_id from the Classes collection
 */
export const getCourseById: Endpoint<CourseId> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: getCourseByIdCallback,
};

/**
 * Get list of review objects for given class from class _id
 */
export const getReviewsByCourseId: Endpoint<CourseId> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: async (courseId: CourseId) => {
    try {
      const regex = new RegExp(/^(?=.*[A-Z])/i);
      if (regex.test(courseId.courseId)) {
        const course = await getCourseByIdCallback(courseId);
        if (course) {
          const crossListOR = getCrossListOR(course);
          const reviews = await Reviews.find({ visible: 1, reported: 0, $or: crossListOR }, {}, { sort: { date: -1 }, limit: 700 }).exec();
          return reviews;
        }
        return { error: "Invalid course id" };
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

export const insertUser: Endpoint<InsertUserRequest> = {
  guard: [body("googleObject").notEmpty()],
  callback: insertUserCallback,
};

export const JSONNonempty = (jsonFieldName: string, fields: string[]) => {
  const ret: ValidationChain[] = [];
  fields.forEach((fieldName) => {
    ret.push(body(`${jsonFieldName}.${fieldName}`).notEmpty());
  });
  return ret;
};

// getUserByNetId
export const insertReview: Endpoint<InsertRequest> = {
  guard: [body("token").notEmpty().isAscii(), body("classId").notEmpty().isAscii()]
    .concat(JSONNonempty("review", ["text", "difficulty", "rating", "workload", "professors", "isCovid"])),
  callback: async (request: InsertRequest) => {
    try {
      const { token } = request;
      const { classId } = request;
      const { review } = request;
      console.log(review);
      console.log("profs", review.professors);


      const ticket = await getVerificationTicket(token);

      if (!ticket) return { resCode: 0, error: "Missing verification ticket" };

      if (ticket.hd === "cornell.edu") {
        // insert the user into the collection if not already present

        await insertUserCallback({ googleObject: ticket });

        if (includesProfanity(review.text)) {
          // eslint-disable-next-line no-console
          console.log("profanity detected in review.");
          return { resCode: 0, error: "Your review contains profanity, please edit your response." };
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
          });

          await fullReview.save();

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


// insert - done
// incrementLike 
// decrementLike

// reportReview

import { body } from "express-validator";
import { getCrossListOR } from "common/CourseCard";
import { Endpoint } from "../endpoints";
import { Classes, Reviews } from "../dbDefs";
import { getCourseById as getCourseByIdCallback } from "./utils";

// The type of a query with a courseId
export interface CourseIdQuery {
  courseId: string;
}

// The type of a query with a course number and subject
interface ClassByInfoQuery {
  subject: string;
  number: string;
}

/**
 * Get a course with this course_id from the Classes collection
 */
export const getCourseById: Endpoint<CourseIdQuery> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: getCourseByIdCallback,
};

/*
 * Searches the database for a course matching the subject and course number. Used in class info retrieval.
 * See also: getCourseById above
 */
export const getCourseByInfo: Endpoint<ClassByInfoQuery> = {
  guard: [body("number").notEmpty().isNumeric(), body("subject").notEmpty().isAscii()],
  callback: async (query: ClassByInfoQuery) => {
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
  callback: async (courseId: CourseIdQuery) => {
    try {
      const course = await getCourseByIdCallback(courseId);
      if (course) {
        const crossListOR = getCrossListOR(course);
        const reviews = await Reviews.find({ visible: 1, reported: 0, $or: crossListOR }, {}, { sort: { date: -1 }, limit: 700 }).exec();
        return reviews;
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

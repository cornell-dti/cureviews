import { body } from "express-validator";
import { getCrossListOR } from "common/CourseCard";
import { Endpoint } from "../endpoints";
import { Reviews } from "../dbDefs";
import { getCourseById as getCourseByIdCallback } from "./utils";

export interface CourseId {
  courseId: string;
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

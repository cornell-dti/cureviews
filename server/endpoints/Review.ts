import { body } from "express-validator";
import { getCrossListOR } from "common/CourseCard";
import { Endpoint } from "../endpoints";
import { Reviews, Classes } from "../dbDefs";

interface CourseId {
  courseId: string;
}

/**
 * Get a course with this course_id from the Classes collection in the local 
 * database.
 */
export const getCourseById: Endpoint<CourseId> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: async (courseId: CourseId) => {
    try {
      // check: make sure course id is valid and non-malicious
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(courseId.courseId)) {
        return await Classes.findOne({ _id: courseId.courseId }).exec();
      }
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getCourseById' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return null;
    }
  },
};

/**
 * Get list of review objects for given class from class _id
 * Accounts for cross-listed reviews
 */
export const getReviewsByCourseId: Endpoint<CourseId> = {
  guard: [body("courseId").notEmpty().isAscii()],
  callback: async (courseId: CourseId) => {
    try {
      const regex = new RegExp(/^(?=.*[A-Z])/i);
      if (regex.test(courseId.courseId)) {
        const course = await getCourseById.callback(courseId);
        if (course) {
          const crossListOR = getCrossListOR(course);
          const reviews = await Reviews.find({ visible: 1, reported: 0, $or: crossListOR }, {}, { sort: { date: -1 }, limit: 700 }).exec();
          return reviews;
        }
        return null;
      }
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getReviewsByCourseId' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return null;
    }
  },
};

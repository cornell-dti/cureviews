import { body } from "express-validator";
import { Endpoint } from "../endpoints";
import { Meteor } from "../shim";
import { Reviews } from "../dbDefs";

interface CourseId {
  courseId: string;
}
// eslint-disable-next-line import/prefer-default-export
export const getReviewsByCourseId = (): Endpoint<CourseId> => ({
  guard: [body("courseId").notEmpty().isAscii()],
  callback: async (courseId: CourseId) => {
    try {
      const regex = new RegExp(/^(?=.*[A-Z])/i);
      if (regex.test(courseId.courseId)) {
        const course = await Meteor.call("getCourseById", courseId);
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
});

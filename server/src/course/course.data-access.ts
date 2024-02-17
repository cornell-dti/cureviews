import { Classes } from "../db/schema.js";

export const findCourseById = async (courseId: string) => await Classes.findOne({ _id: courseId }).exec();

export const findCourseByInfo = async (
  courseNumber: string,
  courseSubject: string,
) => await Classes.findOne({
  classSub: courseSubject,
  classNum: courseNumber,
}).exec();

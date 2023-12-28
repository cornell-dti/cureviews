import { Classes } from '../../db/schema';

export const findCourseById = async (courseId: string) => {
  return await Classes.findOne({ _id: courseId }).exec();
};

export const findCourseByInfo = async (
  courseNumber: string,
  courseSubject: string,
) => {
  return await Classes.findOne({
    classSub: courseSubject,
    classNum: courseNumber,
  }).exec();
};

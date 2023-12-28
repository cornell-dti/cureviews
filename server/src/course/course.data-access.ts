import { Classes } from '../../db/schema';
export const findCourseByInfo = async (
  courseNumber: string,
  courseSubject: string,
) => {
  return await Classes.findOne({
    classSub: courseSubject,
    classNum: courseNumber,
  }).exec();
};

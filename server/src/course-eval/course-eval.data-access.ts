import { CourseEvaluations } from '../../db/schema';

export const findCourseEval = async (subject: string, courseNumber: string) => {
  const cEval = await CourseEvaluations.findOne({ subject, courseNumber }).exec();
  return cEval;
};

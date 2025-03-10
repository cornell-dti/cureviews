import { CourseEvaluations } from '../../db/schema';

export const findCourseEval = async (subject: string, courseNumber: string) => {
  console.log("subj" + subject)
  console.log("num" + courseNumber)
  const cEval = await CourseEvaluations.findOne({ subject, courseNumber }).exec();
  console.log(cEval)
  return cEval;
};

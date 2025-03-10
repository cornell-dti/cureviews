import { findCourseEval } from './course-eval.data-access';
import { CourseEvalRequestType } from './course-eval.type';

export const getCourseEval = async ({
  classSub,
  classNum
}: CourseEvalRequestType) => {
  console.log(classSub);
  console.log(classNum)
  const courseEval = await findCourseEval(classSub, classNum);
  if (!courseEval) return null;
  return courseEval;
};
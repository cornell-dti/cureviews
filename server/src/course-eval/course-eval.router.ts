import express from 'express';

import { CourseEval } from './course-eval';

import {
  getCourseEval,
} from './course-eval.controller';
import { CourseEvalRequestType } from './course-eval.type';

export const courseEvalRouter = express.Router();

/** Reachable at POST /api/course-eval/get-course-eval
 * @body courseNumber: a course's number
 * @body courseSubject: a course's subject code
 * Gets the course evaluation object tied to the given course
 */
courseEvalRouter.post('/get-course-eval', async (req, res) => {
  try {
    const { classSub, classNum }: CourseEvalRequestType = req.body;
    const courseEval: CourseEval = new CourseEval({ classSub, classNum });
    console.log(classSub)
    console.log(classNum)
    const validClassSub: string = courseEval.getClassSub();
    const validClassNum: string = courseEval.getClassNum();
    console.log(validClassSub)
    console.log(validClassNum)

    const courseEvalDoc = await getCourseEval({
      classSub: validClassSub,
      classNum: validClassNum,
    });

    console.log(courseEvalDoc)

    if (courseEvalDoc === null) {
      return res.status(200).json({ result: 0 });
    }

    return res.status(200).json({ result: courseEvalDoc });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
});

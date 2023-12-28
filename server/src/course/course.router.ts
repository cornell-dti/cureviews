import express from 'express';
import { CourseInfoDTO } from './course.dto';
import { findCourseByInfo } from './course.data-access';
import { findCourseSubject } from '../search/search.data-access';

const courseRouter = express.Router();

courseRouter.post('/getCourseByInfo', async (req, res) => {
  try {
    const { number, subject }: CourseInfoDTO = req.body;
    const course = await findCourseByInfo(number, subject);
    return res.status(200).json({ result: course });
  } catch (err) {}
  res.json({ result: 'hello' });
});

export default courseRouter;

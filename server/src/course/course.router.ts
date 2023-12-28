import express from 'express';
import { CourseIdDTO, CourseInfoDTO } from './course.dto';
import { getCourseById, getCourseByInfo } from './course.controller';

const courseRouter = express.Router();

courseRouter.post('/getCourseByInfo', async (req, res) => {
  try {
    const { number, subject }: CourseInfoDTO = req.body;
    const course = await getCourseByInfo({ number, subject });
    return res.status(200).json({ result: course });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

courseRouter.post('/getCourseById', async (req, res) => {
  try {
    const { courseId }: CourseIdDTO = req.body;
    const course = await getCourseById({ courseId });
    return res.status(200).json({ result: course });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

export default courseRouter;

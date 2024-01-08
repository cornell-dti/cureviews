import express from 'express';
import { CourseIdType, CourseInfoType } from './course.type';
import {
  getCourseById,
  getCourseByInfo,
  getReviewsCrossListOR,
} from './course.controller';

const courseRouter = express.Router();

courseRouter.post('/getCourseByInfo', async (req, res) => {
  try {
    const { number, subject }: CourseInfoType = req.body;
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
    const { courseId }: CourseIdType = req.body;
    const course = await getCourseById({ courseId });
    return res.status(200).json({ result: course });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

courseRouter.post('/getReviewsByCourseId', async (req, res) => {
  try {
    const { courseId }: CourseIdType = req.body;
    const reviews = await getReviewsCrossListOR({ courseId });
    return res.status(200).json({ result: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

export default courseRouter;

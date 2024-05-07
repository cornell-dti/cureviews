import express from 'express';

import { CourseIdRequestType, CourseInfoRequestType } from './course.type';
import { getCourseByInfo, getReviewsCrossListOR } from './course.controller';

import { getCourseById } from '../utils';

export const courseRouter = express.Router();

courseRouter.post('/getCourseByInfo', async (req, res) => {
  try {
    const { number, subject }: CourseInfoRequestType = req.body;
    const course = await getCourseByInfo({ number, subject });

    if (!course) {
      return res.status(404).json({
        error: `Course could not be found with subject: ${subject} and number: ${number}`,
      });
    }

    return res.status(200).json({ result: course });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

courseRouter.post('/getCourseById', async (req, res) => {
  try {
    const { courseId }: CourseIdRequestType = req.body;
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
    const { courseId }: CourseIdRequestType = req.body;
    const reviews = await getReviewsCrossListOR({ courseId });

    if (!reviews) {
      return res.status(404).json({
        error: `Reviews could not be found for course id: ${courseId}`,
      });
    }

    return res.status(200).json({ result: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

courseRouter.post('/getReviewTextByCourseId', async (req, res) => {
  try {
    const { courseId }: CourseIdRequestType = req.body;
    const reviews = await getReviewsCrossListOR({ courseId }, true);

    if (!reviews) {
      return res.status(404).json({
        error: `Reviews could not be found for course id: ${courseId}`,
      });
    }

    return res.status(200).json({ result: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

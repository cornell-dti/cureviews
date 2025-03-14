import express from 'express';

import {
  CourseIdRequestType,
  CourseInfoRequestType,
  CourseDescriptionRequestType,
  CourseEvalRequestType
} from './course.type';
import {
  getCourseByInfo,
  getReviewsCrossListOR,
  getRecommendationData,
  getProcessedDescription,
  getSimilarity,
  getGlobalMetadata,
  getCourseEval
} from './course.controller';

import { getCourseById } from '../utils';

export const courseRouter = express.Router();

/** Reachable at POST /api/courses/get-by-info
 * @body number: a course's number
 * @body subject: a course's subject code
 * Gets a course by its subject and number
 */
courseRouter.post('/get-by-info', async (req, res) => {
  try {
    const { number, subject }: CourseInfoRequestType = req.body;
    const course = await getCourseByInfo({ number, subject });

    if (!course) {
      return res.status(404).json({
        error: `Course could not be found with subject: ${subject} and number: ${number}`
      });
    }

    return res.status(200).json({ result: course });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

/** Reachable at POST /api/courses/get-by-id
 * @body courseId: a course's id field
 * Gets a course by its id in the database
 */
courseRouter.post('/get-by-id', async (req, res) => {
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

/** Reachable at POST /api/courses/get-reviews
 * @body courseId: a course's id field
 * Gets the array of all reviews for the course with id = courseId
 */
courseRouter.post('/get-reviews', async (req, res) => {
  try {
    const { courseId }: CourseIdRequestType = req.body;
    const reviews = await getReviewsCrossListOR({ courseId });

    if (!reviews) {
      return res.status(404).json({
        error: `Reviews could not be found for course id: ${courseId}`
      });
    }

    return res.status(200).json({ result: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

/** Reachable at POST /api/courses/get-rec-metadata
 * @body number, subject: a course's subject and number field
 * Gets the array of all recommendation metadata for a specified course
 */
courseRouter.post('/get-rec-metadata', async (req, res) => {
  try {
    const { number, subject }: CourseInfoRequestType = req.body;
    const course = await getRecommendationData({ number, subject });

    if (!course) {
      return res.status(404).json({
        error: `Recommendation data could not be found for ${subject} ${number}`,
      });
    }

    return res.status(200).json({ result: course });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

/** Reachable at POST /api/courses/get-global-metadata
 * Gets the document containing all global metadata for courses
 */
courseRouter.post('/get-global-metadata', async (req, res) => {
  try {
    const global = await getGlobalMetadata();

    return res.status(200).json({ result: global });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

/** Reachable at POST /api/courses/preprocess-desc
 * @body description: a course description
 * Gets the processed description to use for the similarity algorithm
 * Currently used for testing
*/
courseRouter.post('/preprocess-desc', async (req, res) => {
  const { description }: CourseDescriptionRequestType = req.body;
  const processed = getProcessedDescription(description);
  return res.status(200).json({ result: processed });
});

/** Reachable at POST /api/courses/mock-similarity
 * Gets the array of the top 5 similar courses
 * Currently used for testing
*/
courseRouter.post('/mock-similarity', async (req, res) => {
  const similarity = await getSimilarity();
  return res.status(200).json({ result: similarity });
});

/** Reachable at POST /api/courses/get-course-eval
 * @body courseNumber: a course's number
 * @body courseSubject: a course's subject code
 * Gets the course evaluation object tied to the given course
 */
courseRouter.post('/get-course-eval', async (req, res) => {
  try {
    const { classSub, classNum }: CourseEvalRequestType = req.body;

    const courseEvalDoc = await getCourseEval({
      classSub,
      classNum,
    });

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

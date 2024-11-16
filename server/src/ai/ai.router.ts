import express from 'express';
import { CourseIdRequestType } from '../course/course.type';
import { getCoursesWithMinReviews, getReviewsForSummary, summarize, updateCourseWithAI } from './ai.functions';
const aiRouter = express.Router();
aiRouter.use(express.json());

/** Reachable at POST /api/ai/update-all-courses
 * retrieves all course IDs with a minimum of 3 reviews,
 * and then attempts to update the classSummary, classTags, and freshness
 * for each course ID by calling updateCoursesWithAI.
 * returns a message summarizing how many courses were updated successfully
 * and how many failed.
 */
aiRouter.post('/summarize-courses', async (req, res) => {
  try {
    const minReviews = 3;
    //get all courses with at least minimum reviews (will be changed later to check for freshness as well)
    const courseIds = await getCoursesWithMinReviews(minReviews);
    const results = { success: [], incomplete: [] };
    if (!courseIds || courseIds.length === 0) {
      return res.json({ message: `No courses found with at least ${minReviews} reviews.`, results });
    }
    const limitedCourseIds = courseIds.slice(0, 20);
    //loop through each courseId and update
    for (const courseId of courseIds) {
      const success = await updateCourseWithAI(courseId);
      if (success) {
        results.success.push(courseId);
      } else {
        results.incomplete.push(courseId);
      }
    }

    //show how many courses were updated successfully
    console.log(`Incompletely updated courses:  ${results.incomplete}`);
    const message = `Update completed.`;
    return res.status(200).json({ message, details: results });

  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
});

/** Reachable at POST /api/ai/update-course-summary
 * @body a courseId
 * returns a message indicating whether classSumary, classTags, and freshness have
 * been updated successfully for the given courseId
*/
aiRouter.post('/update-course-summary', async (req, res) => {
  try {
    const { courseId }: CourseIdRequestType = req.body;
    const success = await updateCourseWithAI(courseId);
    if (!success) {
      return res.status(404).json({
        error: `Failed to update course with ID: ${courseId}. No reviews found.`,
      });
    }

    return res.status(200).json({ message: `Course ${courseId} updated successfully.` });

  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
})

/** Reachable at POST /api/ai/summarize-reviews
 * @body a block of text containing all reviews from a course
 * returns a dictionary containing the summary and tags created by OpenAI
*/
aiRouter.post('/text/summarize-reviews', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const summaryAndTags = await summarize(text);
    res.status(200).json({ summaryAndTags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/** Reachable at POST /api/ai/get-course-review-text
 * @body a course ID
 * returns a block of text containing all reviews from that course
*/
aiRouter.post('/get-course-review-text', async (req, res) => {
  try {
    const { courseId }: CourseIdRequestType = req.body;
    const reviews = await getReviewsForSummary({ courseId });
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

/** Reachable at POST /api/ai/courseids
 * @body minimum number of reviews needed to create a summary
 * returns all course ids that have at least that number of reviews
*/
aiRouter.post('/courseids', async (req, res) => {
  try {
    const min = req.body.min;
    const ids = await getCoursesWithMinReviews(min);
    if (ids === null) {
      return res.status(400).json({
        error: `No courses found with given minimum number of reviews`,
      });
    }
    return res.status(200).json({
      message: 'Retrieved all courses',
      ids: ids,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});
export default aiRouter;
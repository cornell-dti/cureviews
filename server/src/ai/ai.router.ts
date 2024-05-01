import express from 'express';
import { makeSummary, getCoursesWithMinReviews } from './ai.functions';

const aiRouter = express.Router();

aiRouter.use(express.json());

/** Reachable at POST /api/summarizeReviews
 * @body a block of text containing all reviews from a course
 * returns a summary created by OpenAI
*/
aiRouter.post('/summarizeReviews', async (req, res) => {
  try {
    if (!req.body.text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const summary = await makeSummary(req.body.text);
    res.status(200).json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/** Reachable at POST /api/getCourseIdsForSummary
 * @body minimum number of reviews needed to create a summary
 * returns all course ids that have at least that number of reviews
*/
aiRouter.post('/getCourseIdsForSummary', async (req, res) => {
  try {
    const min = req.body.min;
    const ids = await getCoursesWithMinReviews(min);
    if (ids === null) {
      return res.status(400).json({
        error: `No reviews found`,
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



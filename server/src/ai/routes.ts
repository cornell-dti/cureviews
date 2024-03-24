import { Router } from 'express'
import { minReviewsCosting } from './functions'

const router = Router()

/** Reachable at POST /ai/costing 
 * @body minimum number of reviews a course needs to be included in data
 * returns values used for OpenAI model costing consideration
*/
router.post('/costing', async (req, res) => {
  const min = req.body.min;

  try {
    const costing = await minReviewsCosting(min);
    if (minReviewsCosting === null) {
      return res.status(400).json({
        error: `No reviews found`,
      });
    }

    return res.status(200).json({
      message: 'Retrieved all pending reviews',
      result: costing,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
})


export default router 

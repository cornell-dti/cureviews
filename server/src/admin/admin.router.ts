import express from 'express';
import { Auth } from '../auth/auth';
import { AdminReviewRequestDTO, AdminRequestDTO } from './admin.dto';
import { getReviewableReviews, setReviewVisible } from './admin.controller';

const adminRouter = express.Router();

adminRouter.post('/makeReviewVisible', async (req, res) => {
  try {
    const { token, review }: AdminReviewRequestDTO = req.body;
    const auth = new Auth({ token });
    const reviewVisible = await setReviewVisible(review, auth);
    if (reviewVisible) {
      return res.status(200).json({
        message: `Review with id: ${review.getReviewId()} is now visible!`,
      });
    }

    return res.status(400).json({
      error: `Review has invalid id: ${review.getReviewId()} or user is not an admin.`,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/fetchReviewableClasses', async (req, res) => {
  try {
    const { token }: AdminRequestDTO = req.body;
    const auth = new Auth({ token });
    const reviewableReviews = await getReviewableReviews(auth);
    if (reviewableReviews === null) {
      return res.status(400).json({
        error: `User is not an admin.`,
      });
    }

    return res
      .status(200)
      .json({
        message: 'Retrieved all pending reviews',
        result: reviewableReviews,
      });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

export default adminRouter;

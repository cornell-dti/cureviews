import express from 'express';
import { Auth } from '../auth/auth';
import {
  AdminReviewRequestDTO,
  AdminRequestDTO,
  RaffleWinnerDTO,
} from './admin.dto';
import {
  getPendingReviews,
  setReviewVisible,
  getRaffleWinner,
} from './admin.controller';
import {
  fetchAddSubjects,
  fetchSubjects,
} from '../../scripts/populate-subjects';
import { fetchAddClassesForSubject } from '../../scripts/populate-courses';
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

adminRouter.post('/fetchPendingReviews', async (req, res) => {
  try {
    const { token }: AdminRequestDTO = req.body;
    const auth = new Auth({ token });
    const pendingReviews = await getPendingReviews(auth);
    if (pendingReviews === null) {
      return res.status(400).json({
        error: `User is not an admin.`,
      });
    }

    return res.status(200).json({
      message: 'Retrieved all pending reviews',
      result: pendingReviews,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/getRaffleWinner', async (req, res) => {
  try {
    const { startDate }: RaffleWinnerDTO = req.body;
    const winner = await getRaffleWinner(startDate);

    if (winner === null) {
      return res.status(400).json({
        error: `No raffle winner found.`,
      });
    }

    return res.status(200).json({
      message: 'Retrieved raffle winner',
      result: winner,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/testScripts', async (req, res) => {
  try {
    const subjects = await fetchSubjects(
      'https://classes.cornell.edu/api/2.0/',
      'SP23',
    );

    if (subjects) {
      const result = subjects.map(async (subject) => {
        await fetchAddClassesForSubject(
          subject,
          'https://classes.cornell.edu/api/2.0/',
          'SP23',
        );
      });

      if (result) {
        return res.status(200).json({
          result: true,
        });
      }
    }

    return res.status(200).json({
      result: false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

export default adminRouter;

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
import { fetchSubjects } from '../../scripts/populate-subjects';
import { fetchAddClassesForSubject } from '../../scripts/populate-courses';
import { verifyTokenAdmin } from '../auth/auth.controller';
import { updateReviewVisibility } from '../review/review.data-access';
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

adminRouter.post('/addNewSemester', async (req, res) => {
  const { semester }: { semester: string } = req.body;
  try {
    const subjects = await fetchSubjects(
      'https://classes.cornell.edu/api/2.0/',
      semester,
    );

    if (subjects) {
      const result = await Promise.all(
        subjects.map(async (subject) => {
          await fetchAddClassesForSubject(
            subject,
            'https://classes.cornell.edu/api/2.0/',
            semester,
          );
        }),
      );

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
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/undoReportReview', async (req, res) => {
  const { review, token }: AdminReviewRequestDTO = req.body;
  try {
    const auth = new Auth({ token });
    const isAdmin = await verifyTokenAdmin(auth);
    if (isAdmin) {
      await updateReviewVisibility(review.getReviewId(), 0, 1);
      return res.status(200).json({
        message: `Undo reported review with review id ${review.getReviewId()}`,
      });
    }

    return res
      .status(401)
      .json({
        error: 'User does not have an authorized token (not an admin)!',
      });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

export default adminRouter;

import express from 'express';
import { Auth } from '../auth/auth';
import {
  AdminReviewRequestDTO,
  AdminRequestDTO,
  RaffleWinnerDTO,
} from './admin.dto';
import {
  getPendingReviews,
  setReviewVisibility,
  getRaffleWinner,
  removePendingReview,
} from './admin.controller';
import { fetchSubjects } from '../../scripts/populate-subjects';
import { fetchAddClassesForSubject } from '../../scripts/populate-courses';
import { findAllSemesters } from '../../scripts/utils';
import { resetProfessors } from '../../scripts/populate-professors';

const adminRouter = express.Router();

adminRouter.post('/makeReviewVisible', async (req, res) => {
  try {
    const { token, review }: AdminReviewRequestDTO = req.body;
    const auth = new Auth({ token });
    const reviewVisible = await setReviewVisibility(review._id, auth, 0, 0);
    if (reviewVisible) {
      return res.status(200).json({
        message: `Review with id: ${review._id} is now visible!`,
      });
    }

    return res.status(400).json({
      error: `Review has invalid id: ${review._id} or user is not an admin.`,
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
    const result = await setReviewVisibility(review._id, auth, 0, 1);

    if (result) {
      return res.status(200).json({
        message: `Undo reported review with review id ${review._id}`,
      });
    }

    return res.status(401).json({
      error: 'User does not have an authorized token (not an admin)!',
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/removeReview', async (req, res) => {
  const { review, token }: AdminReviewRequestDTO = req.body;

  try {
    const auth = new Auth({ token });
    const result = await removePendingReview(review._id, auth);

    if (result) {
      return res.status(200).json({
        message: `Undo reported review with review id ${review._id}`,
      });
    }

    return res.status(401).json({
      error: 'User does not have an authorized token (not an admin)!',
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/setProfessors', async (req, res) => {
  const { token }: AdminRequestDTO = req.body;
  try {
    const auth = new Auth({ token });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/resetProfessors', async (req, res) => {
  const { token }: AdminRequestDTO = req.body;
  try {
    const auth = new Auth({ token });
    const semesters = await findAllSemesters();
    const val = await resetProfessors(
      'https://classes.cornell.edu/api/2.0/',
      semesters,
    );

    if (val) {
      return res.status(200).json({ message: 'Professors reset!' });
    }

    return res
      .status(400)
      .json({ error: 'Professors were unable to be reset!' });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

export default adminRouter;

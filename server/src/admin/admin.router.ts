import express from 'express';

import { Auth } from '../auth/auth';
import {
  AdminReviewRequestType,
  AdminRequestType,
  RaffleWinnerRequestType,
  AdminAddSemesterRequestType,
  ReportReviewRequestType,
} from './admin.type';
import {
  getPendingReviews,
  getReportedReviews,
  getReviewCounts,
  getCourseCSV,
  editReviewVisibility,
  removePendingReview,
  updateAllProfessorsDb,
  resetAllProfessorsDb,
  initAllDb,
  addNewSemDb,
  verifyTokenAdmin,
  reportReview,
} from './admin.controller';

export const adminRouter = express.Router();

adminRouter.post('/reportReview', async (req, res) => {
  try {
    const { id }: ReportReviewRequestType = req.body;
    const result = await reportReview({ id });
    if (!result) {
      return res
        .status(400)
        .json({ error: `Review with id: ${id} unable to be reported.` });
    }

    return res
      .status(200)
      .json({ message: `Review with id: ${id} successfully reported.` });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

/*
 * Check if a token is for an admin
 */
adminRouter.post('/tokenIsAdmin', async (req, res) => {
  try {
    const { token } = req.body;
    const auth: Auth = new Auth({ token });

    const isAdmin = await verifyTokenAdmin({ auth });

    return res.status(200).json({ result: isAdmin });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/makeReviewVisible', async (req, res) => {
  try {
    const { token, review }: AdminReviewRequestType = req.body;
    const auth = new Auth({ token });

    if (review.reported !== 1) {
      const reviewVisible = await editReviewVisibility({
        reviewId: review._id,
        auth,
        visibility: 1,
        reported: 0,
      });

      if (reviewVisible) {
        return res.status(200).json({
          message: `Review with id: ${review._id} is now visible!`,
        });
      }
    } else {
      return res.status(400).json({
        error:
          'Review has been reported, to make review visible please undo the report.',
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
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const reviews = await getPendingReviews({ auth });
    if (reviews === null) {
      return res.status(400).json({
        error: `User is not an admin.`,
      });
    }

    return res.status(200).json({
      message: 'Retrieved all pending reviews',
      result: reviews,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/fetchReportedReviews', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const reviews = await getReportedReviews({ auth });
    if (reviews === null) {
      return res.status(400).json({
        error: `User is not an admin.`,
      });
    }

    return res.status(200).json({
      message: 'Retrieved all pending reviews',
      result: reviews,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/countReviews', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const counts = await getReviewCounts({ auth });
    if (counts === null) {
      return res.status(400).json({
        error: `User is not an admin.`
      });
    }
    
    return res.status(200).json({
      message: 'Retrieved review counts',
      result: counts,
    })

  } catch (err) {
      return res.status(500).json({ error: `Internal Server Error: ${err}`});
  }
})

adminRouter.post('/getCourseCSV', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const csv = await getCourseCSV({ auth });
    if (csv === null) {
      return res.status(400).json({
        error: `User is not an admin.`
      })
    }

    return res.status(200).json({
      message: 'Retrieved CSV of approved reviews',
      result: csv
    })

  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}`});
  }
})

adminRouter.post('/addNewSemester', async (req, res) => {
  const { semester, token }: AdminAddSemesterRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await addNewSemDb({ auth, semester });

    if (result === null) {
      return res.status(401).json({
        error: `User is unauthenticated and unauthorized as admin, please sign in.`,
      });
    }

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({ result: true });
      return res;
    }

    return res.status(400).json({
      result: false,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/undoReportReview', async (req, res) => {
  const { review, token }: AdminReviewRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await editReviewVisibility({
      reviewId: review._id,
      auth,
      visibility: 1,
      reported: 0,
    });

    if (result) {
      return res.status(200).json({
        message: `Undo reported review with review id ${review._id}`,
      });
    }

    return res.status(400).json({
      error:
        'User does not have an authorized token (not an admin) or review was not found!',
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/removeReview', async (req, res) => {
  const { review, token }: AdminReviewRequestType = req.body;

  try {
    const auth = new Auth({ token });
    const result = await removePendingReview({ reviewId: review._id, auth });

    if (result) {
      return res.status(200).json({
        message: `Undo reported review with review id ${review._id}`,
      });
    }

    return res.status(400).json({
      error:
        'User does not have an authorized token (not an admin) or review was not found!',
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/setProfessors', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await updateAllProfessorsDb({ auth });

    if (result) {
      return res.status(200).json({ result: true });
    }

    return res.status(400).json({ result: false });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/resetProfessors', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await resetAllProfessorsDb({ auth });

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({ message: 'Professors reset!' });
      return res;
    }

    return res
      .status(400)
      .json({ error: 'Professors were unable to be reset!' });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/dbInit', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = initAllDb({ auth });

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({
        message: `Successfully added all courses and professors from all semesters`,
      });
      return res;
    }

    return res
      .status(400)
      .json({ error: 'Error adding all professors and all courses' });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

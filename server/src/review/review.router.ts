import express from 'express';

import {
  InsertReviewRequestType,
  ReviewLikesRequestType,
  ReportReviewRequestType,
} from './review.type';
import { Auth } from '../auth/auth';
import { verifyToken } from '../auth/auth.controller';
import { findReview, updateReviewLikes } from './review.data-access';
import { setStudentLikedReviews } from '../profile/profile.controller';
import { insertNewReview, reportReview } from './review.controller';

const reviewRouter = express.Router();

reviewRouter.post('/insertReview', async (req, res) => {
  try {
    const { token, courseId, review }: InsertReviewRequestType = req.body;
    const auth = new Auth({ token });

    const result = await insertNewReview({ auth, courseId, review });

    if (!result) {
      res.status(400).json({
        error: `Unable to insert new review, please make sure user is authenticated and review is valid.`,
      });
    }

    return res.status(200).json({
      message: 'Successfully inserted new review!',
      result: result,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

reviewRouter.post('/updateLiked', async (req, res) => {
  try {
    const { token, id }: ReviewLikesRequestType = req.body;
    const auth = new Auth({ token });
    const verified = await verifyToken({ auth });

    if (verified === null) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid verification ticket' });
    }

    const { netId, student } = verified;

    const review = await findReview(id);

    if (!student) {
      return res.status(401).json({
        error:
          'Unauthorized to create a review. Please ensure user is logged in.',
      });
    }

    if (!review) {
      return res.status(404).json({
        error: `Could not find review with review: ${review}`,
      });
    }

    if (
      student.likedReviews !== undefined &&
      student.likedReviews.includes(review._id)
    ) {
      const result = await setStudentLikedReviews({
        netId,
        reviewId: review._id,
      });
      if (!result) {
        return res.status(400).json({
          error: `An error occurred while adding review to student with net id: ${netId} likes.`,
        });
      }
      if (review.likes === undefined) {
        await updateReviewLikes(id, 0, netId);
      } else {
        await updateReviewLikes(id, Math.max(0, review.likes - 1), netId);
      }
    } else {
      await setStudentLikedReviews({ netId, reviewId: review._id });
      if (review.likes === undefined) {
        await updateReviewLikes(id, 1, netId);
      } else {
        await updateReviewLikes(id, review.likes + 1, netId);
      }
    }

    return res.status(200).json({
      message: 'Successfully updated like count on review!',
      review: review,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

reviewRouter.post('/userHasLiked', async (req, res) => {
  try {
    const { token, id }: ReviewLikesRequestType = req.body;
    const auth = new Auth({ token });
    const verified = await verifyToken({ auth });

    if (verified === null) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid verification ticket' });
    }

    const { netId, student } = verified;

    const review = await findReview(id);

    if (!student) {
      return res
        .status(401)
        .json({ error: 'User is unauthorized please login' });
    }

    if (!review) {
      return res
        .status(404)
        .json({ error: `Could not find review: ${review}` });
    }

    if (student.likedReviews && student.likedReviews.includes(review.id)) {
      return res.status(200).json({
        message: 'User has liked review!',
        hasLiked: true,
      });
    } else {
      return res.status(200).json({
        message: 'User has not liked review!',
        hasLiked: false,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

reviewRouter.post('/reportReview', async (req, res) => {
  try {
    const { id }: ReportReviewRequestType = req.body;
    await reportReview(id);
    return res
      .status(200)
      .json({ message: `Review with id: ${id} successfully reported.` });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

export default reviewRouter;

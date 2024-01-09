import express from 'express';

import { InsertReviewRequestType, ReviewLikesRequestType } from './review.type';
import { Auth } from '../auth/auth';
import {
  checkStudentHasLiked,
  insertNewReview,
  updateStudentLiked,
} from './review.controller';

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
    const result = await updateStudentLiked({ auth, reviewId: id });

    if (!result) {
      return res
        .status(400)
        .json({ error: `Error in updating liked review with id: ${id}` });
    }

    return res.status(200).json({
      message: 'Successfully updated like count on review!',
      review: result,
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
    const result = checkStudentHasLiked({ auth, reviewId: id });

    if (result === null) {
      return res
        .status(401)
        .json({ error: `Unauthorized user is not signed in.` });
    }

    if (!result) {
      return res.status(200).json({
        message: `User has not liked review with id: ${id}`,
        hasLiked: false,
      });
    }

    return res.status(200).json({
      message: `User has liked review with id: ${id}`,
      hasLiked: true,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

export default reviewRouter;

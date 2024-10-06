import express from 'express';

import { InsertReviewRequestType, ReportReviewRequestType, ReviewLikesRequestType } from './review.type';
import { Auth } from '../auth/auth';
import {
  checkStudentHasLiked,
  insertNewReview,
  updateStudentLiked,
  setReviewReported,
} from './review.controller';

export const reviewRouter = express.Router();

/** Reachable at POST /api/reviews/post
 * @body token: a user's token
 * @body courseId: a course's id field
 * @body review: an object containing the review information
 * Inserts a new review into the database for the given course. Review requires approval
*/
reviewRouter.post('/post', async (req, res) => {
  try {
    const { token, courseId, review }: InsertReviewRequestType = req.body;
    const auth = new Auth({ token });

    const result = await insertNewReview({ auth, courseId, review });

    if (!result) {
      return res.status(400).json({
        error: `Unable to insert new review, please make sure user is authenticated and review is valid.`,
      });
    }

    return res.status(200).json({
      message: 'Successfully inserted new review!',
      result,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/reviews/update-liked
 * @body token: a user's token
 * @body id: a review's id field
 * Updates the likes for the review with the given id
*/
reviewRouter.post('/update-liked', async (req, res) => {
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

/** Reachable at POST /api/reviews/user-liked
 * @body token: a user's token
 * @body id: a review's id field
 * Returns true if the current user has liked the review with the given id
*/
reviewRouter.post('/user-liked', async (req, res) => {
  try {
    const { token, id }: ReviewLikesRequestType = req.body;
    const auth = new Auth({ token });
    const result = await checkStudentHasLiked({ auth, reviewId: id });

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

/** Reachable at POST /api/reviews/report
 * @body token: a user's token
 * @body id: a Review's _id field
 * Returns true if the review is successfully reported
*/
reviewRouter.post('/report', async (req, res) => {
  try {
    const { token, id }: ReportReviewRequestType = req.body;
    const auth = new Auth({ token });
    const result = await setReviewReported({ auth, reviewId: id });

    if (result === null) {
      return res
        .status(401)
        .json({ error: `Unauthorized user is not signed in.` });
    }

    if (result) {
      return res.status(200).json({
        message: `User reported review with id: ${id}`,
      })
    } else {
      return res.status(400).json({
        message: `Error in reporting review with id: ${id}`,
      })
  }
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});
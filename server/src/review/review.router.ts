import express from 'express';

import {
  InsertReviewType,
  ReviewLikesType,
  ReportReviewType,
} from './review.type';
import { Auth } from '../auth/auth';
import { verifyToken } from '../auth/auth.controller';
import { updateStudentLikedReviews } from '../profile/profile.data-access';
import {
  findReview,
  findClassReviews,
  insertReview,
  updateReviewLikes,
} from './review.data-access';
import shortid from 'shortid';
import { Review } from './review';
import { addStudentReview } from '../profile/profile.controller';
import { reportReview } from './review.controller';

const reviewRouter = express.Router();

reviewRouter.post('/insertReview', async (req, res) => {
  try {
    const { token, courseId, review }: InsertReviewType = req.body;
    const auth = new Auth({ token });
    const verified = await verifyToken({ auth });

    if (verified === null) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid verification ticket' });
    }

    const { netId, student } = verified;

    const reviews = await findClassReviews(courseId);

    if (!student) {
      return res.status(401).json({
        error: `Could not create new review because user is unauthenticated. Please login to continue...`,
      });
    }

    if (reviews.find((v) => v.text === review.text)) {
      res.status(400).json({
        error: 'Review is a duplicate of an already existing review',
      });
    }

    const newReview: Review = new Review({
      _id: shortid.generate(),
      text: review.text,
      difficulty: review.difficulty,
      rating: review.rating,
      workload: review.workload,
      class: courseId,
      date: new Date(),
      visible: 0,
      reported: 0,
      professors: review.professors,
      likes: 0,
      isCovid: review.isCovid,
      user: student._id,
      grade: review.grade,
      major: review.major,
    });

    await insertReview(newReview);
    await addStudentReview(netId, newReview.getReviewId());

    return res.status(200).json({
      message: 'Successfully inserted new review!',
      result: newReview,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

reviewRouter.post('/updateLiked', async (req, res) => {
  try {
    const { token, id }: ReviewLikesType = req.body;
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
      await updateStudentLikedReviews(netId, review._id);

      if (review.likes === undefined) {
        await updateReviewLikes(id, 0, netId);
      } else {
        await updateReviewLikes(id, Math.max(0, review.likes - 1), netId);
      }
    } else {
      await updateStudentLikedReviews(netId, review._id);
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
    const { token, id }: ReviewLikesType = req.body;
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
    const { id }: ReportReviewType = req.body;
    await reportReview(id);
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

export default reviewRouter;

import express from 'express';

import { InsertReviewDTO, ReviewLikesDTO } from './review.dto';
import { Auth } from '../auth/auth';
import { insertUser } from '../auth/auth.controller';
import {
  findStudent,
  updateStudentLikedReviews,
} from '../profile/profile.data-access';
import {
  findReview,
  findReviewDuplicate,
  insertReview,
  updateReviewLikes,
} from './review.data-access';
import shortid from 'shortid';
import { Review } from './review';
import { addStudentReview } from '../profile/profile.controller';

const reviewRouter = express.Router();

reviewRouter.post('/insertReview', async (req, res) => {
  try {
    const { token, courseId, review }: InsertReviewDTO = req.body;
    const auth = new Auth({ token });
    const ticket = await auth.getVerificationTicket();

    if (!ticket) {
      return res.status(401).json({ error: 'Missing verification ticket' });
    }

    if (ticket.hd === 'cornell.edu') {
      await insertUser({ token: ticket });

      const netId = ticket.email.replace('@cornell.edu', '');
      const student = await findStudent(netId);

      const duplicates = await findReviewDuplicate(courseId);

      if (duplicates.find((v) => v.text === review.getText())) {
        res.status(400).json({
          error: 'Review is a duplicate of an already existing review',
        });
      }

      try {
        const newReview: Review = new Review({
          reviewId: shortid.generate(),
          text: review.getText(),
          difficulty: review.getDifficulty(),
          rating: review.getRating(),
          workload: review.getWorkload(),
          courseId: courseId,
          date: new Date(),
          visible: 0,
          reported: 0,
          professors: review.getProfessors(),
          likes: 0,
          isCovid: review.getIsCovid(),
          userId: student._id,
          grade: review.getGrade(),
          major: review.getMajor(),
        });

        await insertReview(newReview);
        await addStudentReview(netId, newReview.getReviewId());

        return res.status(200).json({
          message: 'Successfully inserted new review!',
          result: newReview,
        });
      } catch (err) {
        return res
          .status(500)
          .json({ error: `Internal Server Error: ${err.message}` });
      }
    } else {
      return res.status(400).json({
        error: `Error: a non-Cornell email attempted to insert review`,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

reviewRouter.post('/updateLiked', async (req, res) => {
  try {
    const { token, id }: ReviewLikesDTO = req.body;
    const auth = new Auth({ token });
    const ticket = await auth.getVerificationTicket();

    if (!ticket) {
      return res.status(401).json({ error: 'Missing verification ticket' });
    }

    if (ticket.hd === 'cornell.edu') {
      await insertUser({ token: ticket });

      const netId = ticket.email.replace('@cornell.edu', '');
      const student = await findStudent(netId);
      const review = await findReview(id);

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
    } else {
      return res.status(401).json({
        error: `Error: a non-Cornell email attempted to update likes on a review`,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

reviewRouter.post('/userHasLiked', async (req, res) => {
  try {
    const { token, id }: ReviewLikesDTO = req.body;
    const auth = new Auth({ token });
    const ticket = await auth.getVerificationTicket();

    if (!ticket) {
      return res.status(401).json({ error: 'Missing verification ticket' });
    }

    if (ticket.hd !== 'cornell.edu') {
      return res.status(400).json({
        error: `Error: a non-Cornell email attempted to update likes on a review`,
      });
    }

    await insertUser({ token: ticket });

    const netId = ticket.email.replace('@cornell.edu', '');
    const student = await findStudent(netId);

    const review = await findReview(id);

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

export default reviewRouter;

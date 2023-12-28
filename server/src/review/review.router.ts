import express from 'express';

import { InsertReviewDTO } from './review.dto';
import { Auth } from '../auth/auth';
import { insertUser } from '../auth/auth.controller';
import { findStudent } from '../profile/profile.data-access';
import { findReviewDuplicate } from './review.data-access';
import shortid from 'shortid';
import { Review } from './review';

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
      } catch (err) {}
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

export default reviewRouter;

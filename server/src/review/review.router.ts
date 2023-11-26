import express from 'express';

import { getCrossListOR } from 'common/CourseCard';
import shortid from 'shortid';
import { Reviews, Students } from '../../db/dbDefs';
import { getVerificationTicket } from '../auth/auth.controller';
import {
  getCourseById as getCourseByIdCallback,
  getClassByInfo,
} from '../../data/Classes';
import {
  insertUser as insertUserCallback,
} from './review.controller';
import {
  getReviewById,
  updateReviewLiked,
  sanitizeReview,
  getReviewsByCourse,
} from '../../data/Reviews';
import {
  CourseIdQuery,
  InsertReviewRequest,
  InsertUserRequest,
  ClassByInfoQuery,
  ReviewRequest,
} from './review.dto';

const router = express.Router();

/**
 * Get a course with this course_id from the Classes collection
 */
router.post('/getCourseById', async (req, res) => {
  const { courseId } = req.body as CourseIdQuery;
  try {
    const course = await getCourseByIdCallback(courseId);
    return res.status(200).json({
      message: `Successfully retrieved course by id ${courseId}`,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error trying to retrieve course with id: ${courseId}`,
    });
  }
});

/*
 * Searches the database for a course matching the subject and course number. Used in class info retrieval.
 * See also: getCourseById above
 */
router.post('/getCourseByInfo', async (req, res) => {
  const { number, subject } = req.body as ClassByInfoQuery;
  try {
    const course = await getClassByInfo(subject, number);
    return res.status(200).json({
      message: `Successfully retrieved course by info number: ${number} and subject: ${subject}`,
      data: course,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getCourseByInfo' endpoint");
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get list of review objects for given class from class _id
 */
router.post('/getReviewsByCourseId', async (req, res) => {
  const { courseId } = req.body as CourseIdQuery;
  try {
    const course = await getCourseByIdCallback(courseId);
    if (course) {
      const crossListOR = getCrossListOR(course);
      const reviews = await getReviewsByCourse(crossListOR);

      return res.status(200).json({
        message: `Successfully retrieved reviews by course id: ${courseId}`,
        data: reviews,
      });
    }

    res.status(400).json({ error: 'Malformed Query' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getReviewsByCourseId' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Inserts a new user into the database, if the user was not already present
 *
 * Returns 1 if the user was added to the database, or was already present
 * Returns 0 if there was an error
 */

router.post('/insertUser', async (req, res) => {
  const insertUserRequest = req.body as InsertUserRequest;
  const result = await insertUserCallback(insertUserRequest);
  if (result === 1) {
    return res.status(200).json({ message: 'User successfully added!' });
  }

  res.status(500).json({
    message: 'An error occurred while trying to insert a new user',
  });
});

/**
 * Insert a new review into the database
 *
 * Returns 0 if there was an error
 * Returns 1 on a success
 */
router.post('/insertReview', async (req, res) => {
  const { token, classId, review } = req.body as InsertReviewRequest;

  try {
    const ticket = await getVerificationTicket(token);

    if (!ticket) return { resCode: 1, error: 'Missing verification ticket' };

    if (ticket.hd === 'cornell.edu') {
      // insert the user into the collection if not already present

      const insertUser = await insertUserCallback({ googleObject: ticket });
      if (insertUser === 0) {
        return res.status(500).json({
          error: 'There was an error inserting the user into the database.',
        });
      }
      const netId = ticket.email.replace('@cornell.edu', '');
      const student = await Students.findOne({ netId });

      const related = await Reviews.find({ class: classId });
      if (related.find((v) => v.text === review.text)) {
        return res.status(400).json({
          message:
            'Review is a duplicate of an already existing review for this class!',
        });
      }

      try {
        // Attempt to insert the review
        const fullReview = new Reviews({
          _id: shortid.generate(),
          text: review.text,
          difficulty: review.difficulty,
          rating: review.rating,
          workload: review.workload,
          class: classId,
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

        await fullReview.save();

        const newReviews = student.reviews
          ? student.reviews.concat([fullReview._id])
          : [fullReview._id];
        await Students.updateOne(
          { netId },
          { $set: { reviews: newReviews } },
        ).exec();

        return res
          .status(200)
          .json({
            message: `Successfully inserted review with id ${fullReview._id} into database`,
          });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return res.status(500).json({ error: 'Unexpected error when adding review' });
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('Error: non-Cornell email attempted to insert review');
      res.status(400).json({
        error: 'Error: non-Cornell email attempted to insert review',
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'insert' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: "Error: at 'insert' method" });
  }
});

/**
 * Updates a like on a review. If the student has already liked the review,
 * removes the like, and if the student has not, adds a like.
 */
router.post("/updateLiked", async (req, res) => {
  const { token, id } = req.body as ReviewRequest;
  try {
    let review = await getReviewById(id);

    const ticket = await getVerificationTicket(token);

    if (!ticket) return { resCode: 1, error: 'Missing verification ticket' };

    if (ticket.hd === 'cornell.edu') {
      const insertUser = await insertUserCallback({ googleObject: ticket });
      if (insertUser === 0) {
        return res.status(500).json({ error: "There was an error inserting new user." });
      }

      const netId = ticket.email.replace('@cornell.edu', '');
      const student = await Students.findOne({ netId });

      // removing like
      if (
        student.likedReviews !== undefined
        && student.likedReviews.includes(review.id)
      ) {
        await Students.updateOne(
          { netId },
          { $pull: { likedReviews: review.id } },
        );

        if (review.likes === undefined) {
          await updateReviewLiked(id, 0, student.netId);
        } else {
          // bound the rating at 0
          await updateReviewLiked(id, review.likes - 1, student.netId);
        }
      } else {
        // adding like
        await Students.updateOne(
          { netId: student.netId },
          { $push: { likedReviews: review.id } },
        );

        if (review.likes === undefined) {
          await Reviews.updateOne(
            { _id: id },
            { $set: { likes: 1 }, $push: { likedBy: student.id } },
          ).exec();
        } else {
          await Reviews.updateOne(
            { _id: id },
            {
              $set: { likes: review.likes + 1 },
              $push: { likedBy: student.id },
            },
          ).exec();
        }
      }

      review = await Reviews.findOne({ _id: id }).exec();

      return res.status(200).json({
        message: `Successfully updated review with id ${id}`,
        data: sanitizeReview(review),
      });
    }

    res.status(400).json({
      error: 'Error: non-Cornell email attempted to insert review',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'incrementLike' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/userHasLiked", async (req, res) => {
  const { id, token } = req.body as ReviewRequest;
  try {
    const review = await Reviews.findOne({ _id: id }).exec();
    const ticket = await getVerificationTicket(token);

    if (!ticket) res.status(400).json({ error: 'Missing verification ticket' });

    if (ticket.hd !== 'cornell.edu') {
      return res.status(400).json({
        error: 'Error: non-Cornell email attempted to insert review',
      });
    }

    const insertUser = await insertUserCallback({ googleObject: ticket });
    if (insertUser === 0) {
      return res.status(500).json({ error: "Error occurred while attempting to create new user." });
    }

    const netId = ticket.email.replace('@cornell.edu', '');
    const student = await Students.findOne({ netId });

    let hasLiked = false;
    if (student.likedReviews && student.likedReviews.includes(review.id)) {
      hasLiked = true;
    }

    return res
      .status(200)
      .json({
        message: `Retrieved whether student with netId: ${netId} has liked review with id ${id}`,
        hasLiked,
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'decrementLike' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;

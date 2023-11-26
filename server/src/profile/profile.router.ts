import express from 'express';
import { ProfileRequest, NetIdQuery } from './profile.dto';
import { getUserEmail } from '../auth/auth.controller';
import { getUserByNetId, getStudentReviewIds } from '../data/Students';
import { getNonNullReviews } from '../data/Reviews';

const router = express.Router();

router.post('/getStudentEmailByToken', async (req, res) => {
  const { token } = req.body as ProfileRequest;
  try {
    const email = await getUserEmail(token);

    if (!email) {
      return res.status(400).json({ message: `Email not found: ${email}` });
    }

    res.status(200).json({ message: email });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getStudentEmailByToken' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Counts the number of reviews made by a given student id.
 */
router.post('/countReviewsByStudentId', async (req, res) => {
  const { netId } = req.body as NetIdQuery;
  try {
    const studentDoc = await getUserByNetId(netId);
    if (studentDoc === null) {
      return res.status(404).json({
        message: `Unable to find student with netId: ${netId}`,
      });
    }

    const reviews = await getStudentReviewIds(studentDoc);
    return res.status(200).json({ message: reviews.length });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'countReviewsByStudentId' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * [getTotalLikesByStudentId] returns the total number of likes a student has gotten on their reviews
 */
router.post('/getTotalLikesByStudentId', async (req, res) => {
  const { netId } = req.body as NetIdQuery;
  let totalLikes = 0;
  try {
    const studentDoc = await getUserByNetId(netId);
    if (studentDoc === null) {
      return res.status(404).json({
        message: `Unable to find student with netId: ${netId}`,
      });
    }

    const reviewIds = await getStudentReviewIds(studentDoc);
    const reviews = await getNonNullReviews(reviewIds);
    reviews.forEach((review) => {
      if (review.likes !== undefined) {
        totalLikes += review.likes;
      }
    });

    res
      .status(200)
      .json({
        message: `Successfully retrieved total like by student with netid: ${netId}`,
        data: totalLikes,
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getTotalLikesByStudentId' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * [getReviewsByStudentId] returns a list of review objects that are created by the given student's netID
 */
router.post('/getReviewsbyStudentId', async (req, res) => {
  const { netId } = req.body as NetIdQuery;
  try {
    const studentDoc = await getUserByNetId(netId);
    if (studentDoc === null) {
      return res.status(404).json({
        message: `Unable to find student with netId: ${netId}`,
      });
    }
    const reviewIds = await getStudentReviewIds(studentDoc);
    const reviews = await getNonNullReviews(reviewIds);
    res
      .status(200)
      .json({
        message: `Successfully retrieved reviews from student with id ${netId}`,
        data: reviews,
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getReviewsByStudentId' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

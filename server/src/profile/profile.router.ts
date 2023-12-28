import express from 'express';

import { Profile } from './profile';

import {
  getStudentReviewDocs,
  getTotalLikesByNetId,
} from './profile.controller';

const profileRouter = express.Router();

/**
 * Counts the number of reviews made by a given student id.
 */

profileRouter.post('/countReviewsByStudentId', async (req, res) => {
  try {
    const { netId } = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const studentReviewIds = await getStudentReviewDocs(validNetId);
    if (studentReviewIds === null) {
      return res
        .status(404)
        .json({ error: 'No reviews objects were associated.' });
    }

    return res.status(200).json({ message: studentReviewIds.length });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * [getTotalLikesByStudentId] returns the total number of likes a student has gotten on their reviews
 */

profileRouter.post('/getTotalLikesByStudentId', async (req, res) => {
  try {
    const { netId } = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const totalLikes = await getTotalLikesByNetId(validNetId);
    return res.status(200).json({ message: totalLikes });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * [getReviewsByStudentId] returns a list of review objects that are created by the given student's netID
 */
profileRouter.post('/getReviewsByStudentId', async (req, res) => {
  try {
    const { netId } = req.body;
    const profile: Profile = new Profile({ netId });

    const validNetId: string = profile.getNetId();
    const reviews = await getStudentReviewDocs(validNetId);

    return res.status(200).json({ message: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${err.message}` });
  }
});

export default profileRouter;

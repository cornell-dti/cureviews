import express from 'express';

import { Profile } from './profile';

import {
  getStudentReviewDocs,
  getTotalLikesByNetId,
} from './profile.controller';
import { ProfileInfoRequestType } from './profile.type';

const profileRouter = express.Router();

/**
 * Counts the number of reviews made by a given student id.
 */

profileRouter.post('/countReviewsByStudentId', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const studentReviewIds = await getStudentReviewDocs({ netId: validNetId });
    if (studentReviewIds === null) {
      return res
        .status(404)
        .json({ error: 'No reviews objects were associated.' });
    }

    return res.status(200).json({ result: studentReviewIds.length });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
});

/**
 * [getTotalLikesByStudentId] returns the total number of likes a student has gotten on their reviews
 */

profileRouter.post('/getTotalLikesByStudentId', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const totalLikes: number = await getTotalLikesByNetId({
      netId: validNetId,
    });

    return res.status(200).json({ result: totalLikes });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
});

/**
 * [getReviewsByStudentId] returns a list of review objects that are created by the given student's netID
 */
profileRouter.post('/getReviewsByStudentId', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });

    const validNetId: string = profile.getNetId();
    const reviews = await getStudentReviewDocs({ netId: validNetId });

    return res.status(200).json({ result: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

export default profileRouter;

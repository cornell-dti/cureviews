import express from 'express';

import { Profile } from './profile';

import {
  getStudentReviewDocs,
  getTotalLikesByNetId,
} from './profile.controller';
import { ProfileInfoRequestType } from './profile.type';

export const profileRouter = express.Router();

/**
 * Counts the number of reviews made by a given student id.
 */

profileRouter.post('/profiles/count-reviews', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const studentReviewIds = await getStudentReviewDocs({ netId: validNetId });

    if (studentReviewIds === null || studentReviewIds.length === 0) {
      return res.status(200).json({ result: 0 });
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

profileRouter.post('/profiles/get-likes', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const totalLikes: number = await getTotalLikesByNetId({
      netId: validNetId,
    });

    if (totalLikes === null) {
      return res
        .status(404)
        .json({ error: `Invalid netId, student does not exist.` });
    }

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
profileRouter.post('/get-reviews', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });

    const validNetId: string = profile.getNetId();
    const reviews = await getStudentReviewDocs({ netId: validNetId });

    if (!reviews) {
      return res.status(200).json({ result: [] });
    }

    return res.status(200).json({ result: reviews });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

import express from 'express';

import { Profile } from './profile';

import {
  getStudentMajors,
  getStudentReviewDocs,
  getTotalLikesByNetId, setStudentMajors
} from './profile.controller';
import { ProfileInfoRequestType, ProfileMajorPostType } from './profile.type';

export const profileRouter = express.Router();

/** Reachable at POST /api/profiles/count-reviews
 * @body netId: a user's netId
 * Gets all reviews made by the user with the given netId
 */
profileRouter.post('/count-reviews', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const studentReviewIds = await getStudentReviewDocs({
      netId: validNetId
    });

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

/** Reachable at POST /api/profiles/get-likes
 * @body netId: a user's netId
 * Gets the total number of likes by the user with the given netId
 */
profileRouter.post('/get-likes', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });
    const validNetId: string = profile.getNetId();

    const totalLikes: number = await getTotalLikesByNetId({
      netId: validNetId
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

/** Reachable at POST /api/profiles/get-reviews
 * @body netId: a user's netId
 * Gets the array of reviews made by the user with the given netId
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


/** Reachable at POST /api/profiles/get-majors
 * @body netId: a user's netId
 * Gets the array of major(s) attached to the user with the given netId
 */
profileRouter.post('/get-majors', async (req, res) => {
  try {
    const { netId }: ProfileInfoRequestType = req.body;
    const profile: Profile = new Profile({ netId });

    const validNetId: string = profile.getNetId();
    const majors = await getStudentMajors({ netId: validNetId });

    if (!majors) {
      return res.status(200).json({ result: [] });
    }

    return res.status(200).json({ majors });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

/** Reachable at POST /api/profiles/set-majors
 * @body netId: a user's netId
 * @body majors: a list of new majors to attach to user
 */
profileRouter.post('/set-majors', async (req, res) => {
  try {
    console.log(req.body)
    const { netId, majors }: ProfileMajorPostType = req.body;
    const profile: Profile = new Profile({ netId });

    const validNetId: string = profile.getNetId();
    const success: boolean = await setStudentMajors({ netId: validNetId, majors });

    if (!success) {
      return res.status(404).json({
        error: `Failed to update majors of student with netId: ${netId}. No student found.`,
      });
    }

    return res.status(200).json({ message: "Majors updated successfully." });

  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});
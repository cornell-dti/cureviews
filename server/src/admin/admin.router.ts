import express from 'express';

import { Auth } from '../auth/auth';
import {
  AdminReviewRequestType,
  AdminRequestType,
  AdminUserRequestType,
  AdminAddSemesterRequestType,
  ReportReviewRequestType,
} from './admin.type';
import {
  getPendingReviews,
  getReportedReviews,
  getReviewCounts,
  getCourseCSV,
  editReviewVisibility,
  removePendingReview,
  updateAllProfessorsDb,
  resetAllProfessorsDb,
  updateDatabaseCourseFullSubjectName,
  initAllDb,
  addNewSemDb,
  verifyTokenAdmin,
  reportReview,
  getAdminUsers,
  removeAdmin,
  addAdmin,
  approveReviews,
  addCourseDescriptionsDb,
  addSimilarityDb
} from './admin.controller';

export const adminRouter = express.Router();

/** Reachable at POST /api/admin/token/validate
 * @body token: a session's current token
 * Returns true if the current user has admin privilege
*/
adminRouter.post('/token/validate', async (req, res) => {
  try {
    const { token } = req.body;
    const auth: Auth = new Auth({ token });

    const isAdmin = await verifyTokenAdmin({ auth });

    return res.status(200).json({ result: isAdmin });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/reviews/approve
 * @body token: a session's current token
 * @body review: a pending review object
 * Approves the review, making it visible to all users. For admins only
*/
adminRouter.post('/reviews/approve', async (req, res) => {
  try {
    const { token, review }: AdminReviewRequestType = req.body;
    const auth = new Auth({ token });

    if (review.reported !== 1) {
      const reviewVisible = await editReviewVisibility({
        reviewId: review._id,
        auth,
        visibility: 1,
        reported: 0,
      });

      if (reviewVisible) {
        return res.status(200).json({
          message: `Review with id: ${review._id} is now visible!`,
        });
      }
    } else {
      return res.status(400).json({
        error:
          'Review has been reported, to make review visible please undo the report.',
      });
    }

    return res.status(400).json({
      error: `Review has invalid id: ${review._id} or user is not an admin.`,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/reviews/approve-all
 * @body token: a session's current token
 * Approves all currently pending reviews. For admins only
*/
adminRouter.post('/reviews/approve-all', async (req, res) => {
  try {
    const { token }: AdminReviewRequestType = req.body;
    const auth = new Auth({ token });

    const response = await approveReviews({ auth: auth })
    if (response !== null) {
      return res.status(200).json({
        message: `All pending reviews have been approved`
      })
    } else {
      return res.status(400).json({
        error: `User is not an admin`
      })
    }
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/reviews/report
 * @body id: a review's id field
 * Reports a review, removing it from public visibility
*/
adminRouter.post('/reviews/report', async (req, res) => {
  try {
    const { id }: ReportReviewRequestType = req.body;
    const result = await reportReview({ id });
    if (!result) {
      return res
        .status(400)
        .json({ error: `Review with id: ${id} unable to be reported.` });
    }

    return res
      .status(200)
      .json({ message: `Review with id: ${id} successfully reported.` });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${err.message}` });
  }
});

/** Reachable at POST /api/admin/reviews/restore
 * @body token: a session's current token
 * @body review: a review object
 * Restores a reported review, making it publicly visible. For admins only
*/
adminRouter.post('/reviews/restore', async (req, res) => {
  const { review, token }: AdminReviewRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await editReviewVisibility({
      reviewId: review._id,
      auth,
      visibility: 1,
      reported: 0,
    });

    if (result) {
      return res.status(200).json({
        message: `Undo reported review with review id ${review._id}`,
      });
    }

    return res.status(400).json({
      error:
        'User does not have an authorized token (not an admin) or review was not found!',
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/reviews/remove
 * @body token: a session's current token
 * @body review: a review object
 * Deletes a review permanently. For admins only
*/
adminRouter.post('/reviews/remove', async (req, res) => {
  const { review, token }: AdminReviewRequestType = req.body;

  try {
    const auth = new Auth({ token });
    const result = await removePendingReview({ reviewId: review._id, auth });

    if (result) {
      return res.status(200).json({
        message: `Undo reported review with review id ${review._id}`,
      });
    }

    return res.status(400).json({
      error:
        'User does not have an authorized token (not an admin) or review was not found!',
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/reviews/get-pending
 * @body token: a session's current token
 * Gets all pending reviews and returns them in an array. For admins only
*/
adminRouter.post('/reviews/get-pending', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const reviews = await getPendingReviews({ auth });
    if (reviews === null) {
      return res.status(400).json({
        error: `User is not an admin.`,
      });
    }

    return res.status(200).json({
      message: 'Retrieved all pending reviews',
      result: reviews,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/reviews/get-reported
 * @body token: a session's current token
 * Gets all reported reviews and returns them in an array. For admins only
*/
adminRouter.post('/reviews/get-reported', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const reviews = await getReportedReviews({ auth });
    if (reviews === null) {
      return res.status(400).json({
        error: `User is not an admin.`,
      });
    }

    return res.status(200).json({
      message: 'Retrieved all pending reviews',
      result: reviews,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/reviews/count
 * @body token: a session's current token
 * Returns counts of pending, reported, and approved reviews. For admins only
*/
adminRouter.post('/reviews/count', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const counts = await getReviewCounts({ auth });
    if (counts === null) {
      return res.status(400).json({
        error: `User is not an admin.`
      });
    }

    return res.status(200).json({
      message: 'Retrieved review counts',
      result: counts,
    })

  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
})

/** Reachable at POST /api/admin/reviews/csv
 * @body token: a session's current token
 * Returns a csv string of all courses with reviews and their review counts.
 * For admins only
*/
adminRouter.post('/reviews/csv', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const csv = await getCourseCSV({ auth });
    if (csv === null) {
      return res.status(400).json({
        error: `User is not an admin.`
      })
    }

    return res.status(200).json({
      message: 'Retrieved CSV of approved reviews',
      result: csv
    })

  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
})

/** Reachable at POST /api/admin/users/get
 * @body token: a session's current token
 * Returns an array of all users with admin privilege. For admins only
*/
adminRouter.post('/users/get', async (req, res) => {
  try {
    const { token }: AdminRequestType = req.body;
    const auth = new Auth({ token });
    const admins = await getAdminUsers({ auth });
    if (admins === null) {
      return res.status(400).json({
        error: `User is not an admin.`
      })
    }

    return res.status(200).json({
      message: 'Retrieved admin users',
      result: admins
    })

  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
})

/** Reachable at POST /api/admin/users/remove
 * @body token: a session's current token
 * @body userId: a user's _id field
 * Removes admin privilege from the user with _id = userId. For admins only
*/
adminRouter.post('/users/remove', async (req, res) => {
  const { token, userId }: AdminUserRequestType = req.body;

  try {
    const auth = new Auth({ token });
    const result = await removeAdmin({ auth: auth, id: userId })

    if (result) {
      return res.status(200).json({
        message: `Remove admin privilege from user with id ${userId}`
      });
    }

    return res.status(400).json({
      error: 'User is not an admin.'
    })
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` })
  }
})

/** Reachable at POST /api/admin/users/add
 * @body token: a session's current token
 * @body userId: a user's _id field
 * Grants admin privilege to an existing user with netId = userId
*/
adminRouter.post('/users/add', async (req, res) => {
  const { token, userId }: AdminUserRequestType = req.body;

  try {
    const auth = new Auth({ token });
    const result = await addAdmin({ auth: auth, id: userId })

    if (result) {
      return res.status(200).json({
        message: `Granted admin privilege to user with id ${userId}`
      });
    }

    return res.status(400).json({
      error: 'User is not an admin.'
    })
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` })
  }
})

/** Reachable at POST /api/admin/semester/add
 * @body token: a session's current token
 * @body semester: a string representing the semester
 * Adds all courses to the db for the given semester. For admins only
*/
adminRouter.post('/semester/add', async (req, res) => {
  const { semester, token }: AdminAddSemesterRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await addNewSemDb({ auth, semester });

    if (result === null) {
      return res.status(401).json({
        error: `User is unauthenticated and unauthorized as admin, please sign in.`,
      });
    }

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({ result: true });
      return res;
    }

    return res.status(400).json({
      result: false,
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/professors/add
 * @body token: a session's current token
 * Adds all professors to the db for the given semester. For admins only
*/
adminRouter.post('/professors/add', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await updateAllProfessorsDb({ auth });

    if (result) {
      return res.status(200).json({ result: true });
    }

    return res.status(400).json({ result: false });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/professors/reset
 * @body token: a session's current token
 * Resets all professors in the db for the given semester. For admins only
*/
adminRouter.post('/professors/reset', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await resetAllProfessorsDb({ auth });

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({ message: 'Professors reset!' });
      return res;
    }

    return res
      .status(400)
      .json({ error: 'Professors were unable to be reset!' });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/course/desc', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await addCourseDescriptionsDb({ auth });
    console.log(result)

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({ message: 'Course descriptions added!' });
      return res;
    }

    return res
      .status(400)
      .json({ error: 'Course descriptions were unable to be added!' });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/subjects/update', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await updateDatabaseCourseFullSubjectName({ auth });

    if (result) {
      return res.status(200).json({ result: true });
    }
    return res.status(400).json({ result: false });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/** Reachable at POST /api/admin/db/initialize
 * @body token: a session's current token
 * Initializes the database for the semester. For admins only
*/
adminRouter.post('/db/initialize', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = initAllDb({ auth });

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({
        message: `Successfully added all courses and professors from all semesters`,
      });
      return res;
    }

    return res
      .status(400)
      .json({ error: 'Error adding all professors and all courses' });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

adminRouter.post('/rec/similarity', async (req, res) => {
  const { token }: AdminRequestType = req.body;
  try {
    const auth = new Auth({ token });
    const result = await addSimilarityDb({ auth });
    console.log(result)

    if (result) {
      res.status(200);
      res.set('Connection', 'close');
      res.json({ message: 'Similarity data added!' });
      return res;
    }

    return res
      .status(400)
      .json({ error: 'Similarity data was unable to be added!' });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

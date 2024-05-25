import {
  findPendingReviews,
  findReportedReviews,
  findAllReviewsAfterDate,
  removeReviewById,
  updateReviewVisibility,
  findStudentById,
  updateCourseMetrics,
  findReviewCounts,
  createCourseCSV,
  findAdminUsers,
  removeAdminPrivilege,
  grantAdminPrivilege,
  createNewAdminUser,
  approveAllReviews,
} from './admin.data-access';
import {
  AdminAddSemesterType,
  AdminPendingReviewType,
  AdminReviewVisibilityType,
  RaffleWinnerRequestType,
  ReportReviewRequestType,
  UpdateCourseMetrics,
  VerifyAdminType,
  VerifyManageAdminType
} from './admin.type';

import {
  findStudent,
  findReview,
  getReviewsCrossListOR,
  getCourseById,
} from '../utils';
import { COURSE_API_BASE_URL } from '../utils/constants';

import {
  findAllSemesters,
  addAllProfessors,
  resetProfessors,
  addAllCourses,
  addAllCrossList,
  addCrossList,
  addNewSemester,
} from '../../scripts';
import { fetchAddSubjects } from '../../scripts/populate-subjects';

/**
 * Reports a review by setting its visibility to only admin and updating reported count.
 * Will also update all course metrics accordingly.
 *
 * @param {string} id: Mongo-generated id of review
 * @returns true if operation was successful, false otherwise
 */
export const reportReview = async ({ id }: ReportReviewRequestType) => {
  try {
    await updateReviewVisibility(id, 1, 0);
    return updateCourseMetricsFromReview(id);
  } catch (err) {
    return false;
  }
};

/**
 * Verifies that the token passed in an admin.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if token is from admin, false otherwise
 */
export const verifyTokenAdmin = async ({ auth }: VerifyAdminType) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);

    if (regex.test(auth.getToken())) {
      const ticket = await auth.getVerificationTicket();
      if (ticket && ticket.email) {
        const user = await findStudent(
          ticket.email.replace('@cornell.edu', ''),
        );
        if (user) {
          return user.privilege === 'admin';
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Edits the review visibility given a Mongo generated reviewId
 *
 * @param {string} reviewId: Mongo generated review id.
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @param {visibility} number: 1 if want to set review to visible to public, 0 if review is only visible by admin.
 * @param {reported} number: 1 review was reported, 0 otherwise.
 * @returns true if operation was successful, false otherwise
 */
export const editReviewVisibility = async ({
  reviewId,
  auth,
  visibility,
  reported,
}: AdminReviewVisibilityType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    await updateReviewVisibility(reviewId, reported, visibility);
    return updateCourseMetricsFromReview(reviewId);
  }

  return false;
};

export const approveReviews = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    return approveAllReviews();
  }
}

/**
 * Removes a review from db by mongo generated id.
 *
 * @param {string} reviewId: Mongo generated review id.
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false otherwise
 */
export const removePendingReview = async ({
  reviewId,
  auth,
}: AdminPendingReviewType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });

  if (userIsAdmin) {
    await updateReviewVisibility(reviewId, 0, 0);
    const result = await updateCourseMetricsFromReview(reviewId);
    await removeReviewById(reviewId);
    return result;
  }

  return false;
};

/**
 * Gets all reviews that are pending (visible only to admin).
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns all pending review objects if operation was successful, null otherwise
 */
export const getPendingReviews = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    return findPendingReviews();
  }

  return null;
};

/**
 * Gets all reviews that are reported (visible only to admin).
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns all reported review objects if operation was successful, null otherwise
 */
export const getReportedReviews = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    return findReportedReviews();
  }

  return null;
};

/**
 * Counts all reviews that are approved, pending, and reported.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns all counts if operation was successful, null otherwise
 */
export const getReviewCounts = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    const counts = findReviewCounts();
    return counts;
  }
}

/**
 * Gets CSV text string of all reviews that are approved, sorted by class.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns CSV text if operation was successful, null otherwise
 */
export const getCourseCSV = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    const csv = await createCourseCSV();
    return csv;
  }
}

/**
 * Gets all users with admin privilege.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns all admin users if operation was successful, null otherwise
 */
export const getAdminUsers = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    const admins = await findAdminUsers();
    return admins;
  }
}

/**
 * Removes a user's admin privilege by id. Assumes that the user is already in the
 * database because they are retrieved into the ManageAdminModal
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @param {string} id: String identifying the user in the database
 * @returns all admin users if operation was successful, null otherwise
 */
export const removeAdmin = async ({ auth, id }: VerifyManageAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    const res = await removeAdminPrivilege(id);
    return res;
  }
}

/**
 * Grants a user admin privilege by updating them if they are in the database.
 * If the user is not in the database, creates a new user with their netid and admin privilege
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @param {string} id: String identifying the user by netid
 * @returns The user with updated admin privilege if operation was successful, null otherwise
 */
export const addOrUpdateAdmin = async ({ auth, id }: VerifyManageAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    let res = await grantAdminPrivilege(id);
    if (res.nModified === 0) {
      res = await createNewAdminUser(id);
    }
    return res;
  }
}

/**
 * Updated all professors in the database by scraping through the Cornell course API.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
export const updateAllProfessorsDb = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await addAllProfessors(semesters);

  return result;
};

export const resetAllProfessorsDb = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await resetProfessors(COURSE_API_BASE_URL, semesters);

  return result;
};

/**
 * Updates all subjects in the database to represent their full subject names
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
export const updateSubjectsDb = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await fetchAddSubjects(COURSE_API_BASE_URL, semesters);

  return result;
}

/**
 * Helper function to get metrics associated with a course
 *
 * @param allReviews: all visible reviews for a course
 * @returns {UpdateCourseMetrics} with all updated rating, difficulty, and workload metrics
 */
const getMetricValues = (allReviews): UpdateCourseMetrics => {
  // create summation variables for reviews
  let sumRating = 0;
  let sumDiff = 0;
  let sumWork = 0;

  // create size counting variables
  let countRating = 0;
  let countDiff = 0;
  let countWork = 0;

  allReviews.forEach((review) => {
    sumDiff += review.difficulty ? review.difficulty : 0;
    countDiff += review.difficulty ? 1 : 0;

    sumRating += review.rating ? review.rating : 0;
    countRating += review.rating ? 1 : 0;

    sumWork += review.workload ? review.workload : 0;
    countWork += review.workload ? 1 : 0;
  });

  const resultRating = countRating > 0 ? sumRating / countRating : null;
  const resultWork = countWork > 0 ? sumWork / countWork : null;
  const resultDiff = countDiff > 0 ? sumDiff / countDiff : null;

  return { rating: resultRating, workload: resultWork, diff: resultDiff };
};

/**
 * Updates metric for a particular class that the given reviewId is associated with
 *
 * @param {string} reviewId: Mongo-generated id of review
 * @returns true if operation was successful, false otherwise
 */
export const updateCourseMetricsFromReview = async (reviewId: string) => {
  try {
    const review = await findReview(reviewId);

    if (!review) {
      return false;
    }

    const course = await getCourseById({ courseId: review.class });

    if (course) {
      const reviews = await getReviewsCrossListOR({ courseId: course._id });

      const state: UpdateCourseMetrics = getMetricValues(reviews);
      await updateCourseMetrics(review, state);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Adds all courses and professors and all cross listed courses to database for every semester available on the Course API.
 * This initializes the database completely should only be called for testing purposes.
 * NEVER CALL IN PRODUCTION.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
export const initAllDb = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const coursesResult = await addAllCourses(COURSE_API_BASE_URL, semesters);

  if (!coursesResult) {
    return false;
  }

  const result = await addAllCrossList(semesters);
  return result;
};

/**
 * Adds all courses and professors and all cross listed courses to database for specified semester.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
export const addNewSemDb = async ({ auth, semester }: AdminAddSemesterType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const coursesResult = await addNewSemester(COURSE_API_BASE_URL, semester);

  if (!coursesResult) {
    return false;
  }

  const result = await addCrossList(semester);
  return result;
};

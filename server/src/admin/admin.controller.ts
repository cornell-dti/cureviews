import {
  findApprovedReviews,
  findPendingReviews,
  findReportedReviews,
  removeReviewById,
  updateReviewVisibility,
  updateCourseMetrics,
  findReviewCounts,
  createCourseCSV,
  findAdminUsers,
  removeAdminPrivilege,
  grantAdminPrivilege,
  approveAllReviews,
  findReviewsByDate,
  getCourseReviews,
  findStudentByUser
} from './admin.data-access';
import {
  AdminAddSemesterType,
  AdminPendingReviewType,
  AdminReviewVisibilityType,
  UpdateCourseMetrics,
  VerifyAdminType,
  VerifyManageAdminType,
  AddAdminParams
} from './admin.type';

import {
  findStudent,
  findReview,
  getReviewsCrossListOR,
  getCourseById
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
  addAllDescriptions,
  addAllProcessedDescriptions,
  addIdfVector,
  addAllTfIdfVectors,
  addAllSimilarityData
} from '../../scripts';
import { fetchAddSubjects } from '../../scripts/populate-subjects';
import { addCurrCourseEvals } from '../../scripts/populate-course-evals';

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
          ticket.email.replace('@cornell.edu', '')
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
  reported
}: AdminReviewVisibilityType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    await updateReviewVisibility(reviewId, reported, visibility);
    return updateCourseMetricsFromReview(reviewId);
  }

  return false;
};

/**
 * Approves all pending reviews
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns Result of the approval process or an error message.
 */
export const approveReviews = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    return approveAllReviews();
  }
};

/**
 * Removes a review from db by mongo generated id.
 *
 * @param {string} reviewId: Mongo generated review id.
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false otherwise
 */
export const removePendingReview = async ({
  reviewId,
  auth
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
 * Gets x most recent reviews of a certain that are approved (visible on admin page).
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @param {number} limit: The number of approved reviews to retrieve.
 * @returns all number of approved review objects if operation was successful, null otherwise.
 */
export const getApprovedReviews = async ({
  auth,
  limit = 700
}: VerifyAdminType & { limit?: number }) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    return findApprovedReviews(limit);
  }

  return null;
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
};

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
};

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
};

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
};

/**
 * Grants a user admin privilege by updating them if they are in the database.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @param {string} id: String identifying the user by netid
 * @param {string} role: Role to assign to the user (e.g., 'Designer', 'PM')
 * @param {string} firstName: firstName to update the user with
 * @param {string} lastName: lastName to update the user with
 * @returns The user with updated admin privilege if operation was successful, null otherwise
 */
export const addAdmin = async ({
  auth,
  id,
  role,
  firstName,
  lastName
}: AddAdminParams) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    const res = await grantAdminPrivilege(id, role, firstName, lastName);
    return res;
  }
  return null;
};

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

/**
 * Resets all professor arrays in the database to empty arrays
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
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
export const updateDatabaseCourseFullSubjectName = async ({
  auth
}: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await fetchAddSubjects(COURSE_API_BASE_URL, semesters);

  return result;
};

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
      const reviews = await getReviewsCrossListOR({
        courseId: course._id
      });

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

/**
 * Adds all course evals based on hard-coded files (since this operation won't happen often).
 *
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
export const addNewCourseEvals = async (
  { auth }: VerifyAdminType,
  resetEvals: boolean
) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  // UNCOMMENT WHEN USING FUNCTION!!!!!!
  // return await addCurrCourseEvals();

  return false;
};

/**
 * Adds all course descriptions to the database after updating the courses for the most recent semester.
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
export const addCourseDescriptionsDb = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const descriptionResult = await addAllDescriptions();
  return descriptionResult;
};

/**
 * Adds all similarity data to the Course database, consisting of tags and top 5 similar courses
 * https://www.notion.so/Similar-Courses-Algorithm-13d0ad723ce18060b34eccc5385d08ca
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
export const addSimilarityDb = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }
  // UNCOMMENT IF YOU NEED TO PROCESS THESE, but likely not necessary

  // const descriptionResult = await addAllProcessedDescriptions();
  // const idfResult = await addIdfVector();
  // const tfidfResult = await addAllTfIdfVectors();
  const similarityResult = await addAllSimilarityData();
  return similarityResult;
};

/* DRAWING RAFFLE WINNER CODE: */
class RaffleMap<K, V> extends Map<K, V> {
  constructor(private defaultFactory: () => V) {
    super();
  }

  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.defaultFactory());
    }
    return super.get(key);
  }
}

interface DefaultRaffleValue {
  entries: number;
  reviews: number;
  bonus: boolean;
}

/**
 *
 * @param {Auth} auth: Object that represents the authentication of a request being passed in.
 * @param start date
 * @returns student netid that won the raffle. [done without replacement/removal]
 */
export const drawRaffle = async ({ auth, start }: VerifyAdminType & { start: Date }) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const raffleMap = new RaffleMap<string, DefaultRaffleValue>(() => ({
    entries: 0,
    reviews: 0,
    bonus: false
  }));
  const reviews = await findReviewsByDate(start);

  // loop thru reviews and update number of entries
  await Promise.all(
    reviews.map(async (review) => {
      const reviews = await getCourseReviews(review.class);
      const count = reviews.length;
      const user = review.user;
      const userValue = raffleMap.get(user);
      userValue.reviews += 1;
      if (userValue.reviews >= 5 && !userValue.bonus) {
        userValue.entries += 5;
        userValue.bonus = true;
      }
      if (count > 3) {
        userValue.entries += 3;
      } else {
        userValue.entries += 1;
      }
      raffleMap.set(user, userValue);
    })
  );

  // draw a random winner
  let totalEntries = 0;
  raffleMap.forEach((values) => (totalEntries += values.entries));
  const winningNumber = Math.random() * totalEntries;
  let currentSum = 0;
  let winner = '';
  for (const [user, values] of raffleMap) {
    currentSum += values.entries;
    if (currentSum > winningNumber) {
      winner = user;
      break;
    }
  }
  // return the students netid
  const student = await findStudentByUser(winner);
  return student.netId;
};

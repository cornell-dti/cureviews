import {
  findAllPendingReviews,
  findAllReviewsAfterDate,
  removeReview,
  updateReviewVisibility,
  findStudentById,
  updateCourseMetrics,
} from './admin.data-access';

import {
  AdminAddSemesterType,
  AdminPendingReviewType,
  AdminReviewVisibilityType,
  RaffleWinnerRequestType,
  ReportReviewRequestType,
  UpdateCourseMetrics,
  VerifyAdminType,
} from './admin.type';

import {
  findStudent,
  findReview,
  findReviewCrossListOR,
  getCrossListOR,
  getCourseById,
} from '../utils';
import { COURSE_API_BASE_URL } from '../utils/constants';

import { findAllSemesters } from '../../scripts/utils';
import {
  addAllProfessors,
  resetProfessors,
} from '../../scripts/populate-professors';
import {
  addAllCourses,
  addCrossList,
  addNewSemester,
} from '../../scripts/populate-courses';

export const reportReview = async ({ id }: ReportReviewRequestType) => {
  try {
    await updateReviewVisibility(id, 1, 0);
    return updateCourseMetricsFromReview(id);
  } catch (err) {
    return false;
  }
};

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

export const removePendingReview = async ({
  reviewId,
  auth,
}: AdminPendingReviewType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    await updateReviewVisibility(reviewId, 0, 0);
    const result = await updateCourseMetricsFromReview(reviewId);
    await removeReview(reviewId);
    return true && result;
  }

  return false;
};

export const getPendingReviews = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    return findAllPendingReviews();
  }

  return null;
};

export const getRaffleWinner = async ({
  startDate,
}: RaffleWinnerRequestType) => {
  const date = new Date(startDate);
  const reviews = await findAllReviewsAfterDate(date);
  if (reviews.length <= 0) {
    return null;
  }

  const student = await findStudentById(reviews[0].user);
  if (!student) {
    return null;
  }

  return student.netId;
};

export const updateAllProfessors = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await addAllProfessors(semesters);

  return result;
};

export const resetAllProfessors = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await resetProfessors(COURSE_API_BASE_URL, semesters);

  return result;
};

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

// This updates the metrics for an individual class given its Mongo-generated id.
export const updateCourseMetricsFromReview = async (reviewId: string) => {
  try {
    const review = await findReview(reviewId);

    if (!review) {
      return false;
    }

    const course = await getCourseById({ courseId: review.class });

    if (course) {
      const crossList = getCrossListOR(course);
      const reviews = await findReviewCrossListOR(crossList);

      const state: UpdateCourseMetrics = getMetricValues(reviews);
      await updateCourseMetrics(review, state);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const addAllCoursesAndProfessors = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const coursesResult = await addAllCourses(COURSE_API_BASE_URL, semesters);
  const result = await addCrossList(semesters);

  if (coursesResult) {
    return result;
  }

  return false;
};

export const addNewSemesterCoursesAndProfessors = async ({
  auth,
  semester,
}: AdminAddSemesterType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const result = await addNewSemester(COURSE_API_BASE_URL, semester);
  return result;
};

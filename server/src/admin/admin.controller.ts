import {
  findAllPendingReviews,
  findAllReviewsAfterDate,
  removeReview,
  updateReviewVisibility,
  findStudentById,
} from './admin.data-access';
import {
  AdminAddSemesterType,
  AdminPendingReviewType,
  AdminReviewVisibilityType,
  RaffleWinnerRequestType,
  ReportReviewRequestType,
  VerifyAdminType,
} from './admin.type';

import { findStudent } from '../utils';

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
import { COURSE_API_BASE_URL } from '../utils/constants';
import { getCourseById } from '../course/course.controller';
import { Classes, Reviews } from '../../db/schema';
import { crossListOR, getMetricValues } from '../../../common/CourseCard';
import { findReview } from '../review/review.data-access';

export const reportReview = async ({ id }: ReportReviewRequestType) => {
  try {
    const review = await findReview(id);

    if (review) {
      await updateReviewVisibility(id, 1, 0);
      const courseId = review.class;
      return updateCourseMetrics(courseId);
    }

    return false;
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
    const review = await findReview(reviewId);
    if (review) {
      await updateReviewVisibility(reviewId, reported, visibility);
      const courseId = review.class;
      return updateCourseMetrics(courseId);
    }
    return false;
  }

  return false;
};

export const removePendingReview = async ({
  reviewId,
  auth,
}: AdminPendingReviewType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    const review = await findReview(reviewId);
    if (review) {
      await removeReview(reviewId);
      const courseId = review.class;
      return await updateCourseMetrics(courseId);
    }
    return false;
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

// This updates the metrics for an individual class given its Mongo-generated id.
// Returns 1 if successful, 0 otherwise.
export const updateCourseMetrics = async (courseId: string) => {
  try {
    const course = await getCourseById({ courseId });
    if (course) {
      const crossList = crossListOR(course);
      const reviews = await Reviews.find(
        { visible: 1, reported: 0, $or: crossList },
        {},
        { sort: { date: -1 }, limit: 700 },
      ).exec();
      const state = getMetricValues(reviews);
      await Classes.updateOne(
        { _id: courseId },
        {
          $set: {
            // If no data is available, getMetricValues returns "-" for metric
            classDifficulty:
              state.diff !== '-' && !isNaN(Number(state.diff))
                ? Number(state.diff)
                : null,
            classRating:
              state.rating !== '-' && !isNaN(Number(state.rating))
                ? Number(state.rating)
                : null,
            classWorkload:
              state.workload !== '-' && !isNaN(Number(state.workload))
                ? Number(state.workload)
                : null,
          },
        },
      );
      return true;
    }

    // eslint-disable-next-line no-console
    console.log(`updateCourseMetrics unable to find id ${courseId}`);
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'updateCourseMetrics' method");
    // eslint-disable-next-line no-console
    console.log(error);
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

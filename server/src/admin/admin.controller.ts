import {
  findAllPendingReviews,
  findAllReviewsAfterDate,
} from './admin.data-access';
import {
  updateReviewVisibility,
  removeReview,
} from '../review/review.data-access';
import { findStudent } from '../profile/profile.data-access';
import {
  AdminAddSemesterType,
  AdminPendingReviewType,
  AdminReviewVisibilityType,
  RaffleWinnerRequestType,
} from './admin.type';
import { VerifyAuthType } from '../auth/auth.type';

import { findAllSemesters } from '../../scripts/utils';
import {
  addAllProfessors,
  resetProfessors,
} from '../../scripts/populate-professors';
import { addAllCourses, addNewSemester } from '../../scripts/populate-courses';

export const verifyTokenAdmin = async ({ auth }: VerifyAuthType) => {
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
    return true;
  }

  return false;
};

export const removePendingReview = async ({
  reviewId,
  auth,
}: AdminPendingReviewType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    await removeReview(reviewId);
    return true;
  }

  return false;
};

export const getPendingReviews = async ({ auth }: VerifyAuthType) => {
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

  const student = await findStudent(reviews[0].user);
  if (!student) {
    return null;
  }

  return student.netId;
};

export const updateAllProfessors = async ({ auth }: VerifyAuthType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await addAllProfessors(semesters);
  return result;
};

export const resetAllProfessors = async ({ auth }: VerifyAuthType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await resetProfessors(
    'https://classes.cornell.edu/api/2.0/',
    semesters,
  );

  return result;
};

export const addAllCoursesAndProfessors = async ({ auth }: VerifyAuthType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const coursesResult = await addAllCourses(semesters);
  const professorsResult = await addAllProfessors(semesters);

  if (coursesResult && professorsResult) {
    return true;
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

  const result = await addNewSemester(
    'https://classes.cornell.edu/api/2.0/',
    semester,
  );
  return result;
};

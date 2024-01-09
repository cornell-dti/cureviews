import {
  findAllPendingReviews,
  findAllReviewsAfterDate,
} from './admin.data-access';
import {
  updateReviewVisibility,
  removeReview,
} from '../review/review.data-access';
import { verifyTokenAdmin } from '../auth/auth.controller';
import { findStudent } from '../profile/profile.data-access';
import {
  AdminPendingReviewType,
  AdminReviewVisibilityType,
  RaffleWinnerRequestType,
} from './admin.type';
import { VerifyAuthType } from '../auth/auth.type';

export const setReviewVisibility = async ({
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
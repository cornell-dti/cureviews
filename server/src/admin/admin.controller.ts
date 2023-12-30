import { Auth } from '../auth/auth';
import { Review } from '../review/review';
import {
  findAllPendingReviews,
  findAllReviewsAfterDate,
} from './admin.data-access';
import { updateReviewVisibility } from '../review/review.data-access';
import { verifyTokenAdmin } from '../auth/auth.controller';
import { findStudent } from '../profile/profile.data-access';

export const setReviewVisible = async (review: Review, auth: Auth) => {
  const userIsAdmin = await verifyTokenAdmin(auth);
  if (userIsAdmin) {
    await updateReviewVisibility(review.getReviewId(), 0, 0);
    return true;
  }

  return false;
};

export const getPendingReviews = async (auth: Auth) => {
  const userIsAdmin = await verifyTokenAdmin(auth);
  if (userIsAdmin) {
    return findAllPendingReviews();
  }

  return null;
};

export const getRaffleWinner = async (startDate: string) => {
  const date = new Date(startDate);
  const reviews = await findAllReviewsAfterDate(date);
  if (reviews.length <= 0) {
    return null;
  }

  const { netId } = await findStudent(reviews[0].user);
  return netId;
};

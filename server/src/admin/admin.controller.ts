import { Auth } from '../auth/auth';
import { Review } from '../review/review';
import {
  updateReviewVisibility,
  findAllPendingReviews,
} from './admin.data-access';
import { verifyTokenAdmin } from '../auth/auth.controller';

export const setReviewVisible = async (review: Review, auth: Auth) => {
  const userIsAdmin = await verifyTokenAdmin(auth);
  if (userIsAdmin) {
    await updateReviewVisibility(review.getReviewId());
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

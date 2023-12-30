import { Auth } from '../auth/auth';
import { Review } from '../review/review';
import { findAllPendingReviews } from './admin.data-access';
import { updateReviewVisibility } from '../review/review.data-access';
import { verifyTokenAdmin } from '../auth/auth.controller';

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

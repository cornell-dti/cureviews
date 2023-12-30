import { Auth } from '../auth/auth';
import { Review } from '../review/review';
import {
  updateReviewVisibility,
  findAllReviewableReviews,
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

export const getReviewableReviews = async (auth: Auth) => {
  const userIsAdmin = await verifyTokenAdmin(auth);
  if (userIsAdmin) {
    return findAllReviewableReviews();
  }

  return null;
};

import { updateReviewVisibility } from './review.data-access';
export const reportReview = async (id: string) => {
  await updateReviewVisibility(id, 1, 0);
};

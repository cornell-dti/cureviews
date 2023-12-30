import { Reviews } from '../../db/schema';

export const updateReviewVisibility = async (reviewId: string) => {
  await Reviews.updateOne({ _id: reviewId }, { $set: { visible: 1 } }).exec();
};

export const findAllPendingReviews = async () => {
  return await Reviews.find(
    { visible: 0 },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();
};

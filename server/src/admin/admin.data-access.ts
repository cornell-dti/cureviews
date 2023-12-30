import { Reviews } from '../../db/schema';

export const findAllPendingReviews = async () => {
  return await Reviews.find(
    { visible: 0 },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();
};

export const findAllReviewsAfterDate = async (date: Date) => {
  return await Reviews.aggregate([
    { $match: { date: { $gte: date } } },
    { $sample: { size: 1 } },
  ]);
};

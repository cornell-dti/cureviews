import { Reviews } from '../../db/schema';

export const findAllPendingReviews = async () => {
  return await Reviews.find(
    { visible: 0 },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();
};

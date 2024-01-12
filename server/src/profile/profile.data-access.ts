import { Reviews } from '../../db/schema';

export const findReviewDocsByNetId = async (netId: string) => {
  const reviews = await Reviews.find({ user: netId }).exec();
  return reviews;
};

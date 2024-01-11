import { Reviews, Students } from '../../db/schema';

export const findReviewDocsByNetId = async (netId: string) => {
  const reviews = await Reviews.find({ user: netId }).exec();
  return reviews;
};

export const updateStudentReviews = async (
  netId: string,
  newReviews: string[],
) => {
  await Students.updateOne({ netId }, { $set: { reviews: newReviews } }).exec();
};

export const updateStudentLikedReviews = async (
  netId: string,
  reviewId: string,
  liked: boolean,
) => {
  if (liked) {
    await Students.updateOne(
      { netId },
      { $push: { likedReviews: reviewId } },
    ).exec();
  } else {
    await Students.updateOne(
      { netId },
      { $pull: { likedReviews: reviewId } },
    ).exec();
  }
};

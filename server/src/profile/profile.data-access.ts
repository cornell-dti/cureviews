import { Reviews, Students } from '../../db/schema';

export const findReviewDoc = async (reviewId: string) => {
  const review = await Reviews.findOne({ _id: reviewId }).exec();
  return review;
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

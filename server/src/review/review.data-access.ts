import { Reviews, Students } from '../../db/schema';
import { Review } from './review';

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

export const findClassReviews = async (courseId: string) => {
  const reviews = await Reviews.find({ class: courseId });
  return reviews;
};

export const insertReview = async (review: Review) => {
  const newReview = new Reviews(review);
  await newReview.save();
};

export const updateReviewLikes = async (
  reviewId: string,
  likes: number,
  netId: string,
) => {
  await Reviews.updateOne(
    { _id: reviewId },
    { $set: { likes } },
    { $pull: { likedBy: netId } },
  );
};

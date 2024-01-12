import { Reviews } from '../../db/schema';
import { Review } from './review';

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

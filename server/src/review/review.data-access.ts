import { Reviews } from '../../db/schema';

export const findReviewCrossListOR = async (crossListOR) => {
  const reviews = await Reviews.find(
    { visible: 1, reported: 0, $or: crossListOR },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();

  return reviews;
};

export const findReviewDuplicate = async (courseId: string) => {
  const duplicates = await Reviews.find({ class: courseId });
  return duplicates;
};

export const insertReview = async (review) => {
  const newReview = new Reviews(review);
  await newReview.save();
};

export const findReview = async (reviewId: string) => {
  const review = await Reviews.findOne({ _id: reviewId }).exec();
  return review;
};

export const updateReviewLikes = async (
  reviewId: string,
  likes: number,
  netId: string,
) => {
  await Reviews.updateOne(
    { _id: reviewId },
    { $set: { likes: likes } },
    { $pull: { likedBy: netId } },
  );
};

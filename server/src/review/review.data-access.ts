import { Reviews, Classes, Students } from '../../db/schema';
import { Review } from './review';

export const findReviewCrossListOR = async (crossListOR) => {
  const reviews = await Reviews.find(
    { visible: 1, reported: 0, $or: crossListOR },
    {},
    { sort: { date: -1 }, limit: 700 }
  ).exec();

  return reviews;
};

export const findReview = async (reviewId: string) => {
  const review = await Reviews.findOne({ _id: reviewId }).exec();
  return review;
};

export const updateStudentReviews = async (
  netId: string,
  newReviews: string[]
) => {
  await Students.updateOne({ netId }, { $set: { reviews: newReviews } }).exec();
};

export const updateStudentMajors = async (
  netId: string,
  majors: string[]
) => {
  await Students.updateOne({ netId }, { $set: { majors } }).exec();
};

export const updateStudentLikedReviews = async (
  netId: string,
  reviewId: string,
  liked: boolean
) => {
  if (liked) {
    await Students.updateOne(
      { netId },
      { $push: { likedReviews: reviewId } }
    ).exec();
  } else {
    await Students.updateOne(
      { netId },
      { $pull: { likedReviews: reviewId } }
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
  const courseId = review['class'];
  await Classes.updateOne(
    { _id: courseId },
    { $inc: { summaryFreshness: 1 } }
  );
  const userId = newReview.user;
  const pendingReviews = await Reviews.find({ user: userId, visible: 0, reported: 0 }).exec();
  return pendingReviews
};

export const updateReviewLikedBy = async (
  reviewId: string,
  id: string,
  liked: boolean
) => {
  if (liked) {
    await Reviews.updateOne({ _id: reviewId }, { $addToSet: { likedBy: id } });
  } else {
    await Reviews.updateOne({ _id: reviewId }, { $pull: { likedBy: id } });
  }
};

export const updateReviewLikes = async (reviewId: string, likes: number) => {
  await Reviews.updateOne({ _id: reviewId }, { $set: { likes } });
};

export const hideReportedReview = async (reviewId: string) => {
  await Reviews.updateOne(
    { _id: reviewId },
    { $set: { visible: 0, reported: 1 } }
  );
};

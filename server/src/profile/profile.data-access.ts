import { ReviewDocument, Reviews, Students } from '../../db/schema';

export const findStudent = async (netId: string) => {
  const student = await Students.findOne({ netId }).exec();
  return student;
};

export const findReviewDoc = async (reviewId: string) => {
  const review = await Reviews.findOne({ _id: reviewId });
  return review;
};

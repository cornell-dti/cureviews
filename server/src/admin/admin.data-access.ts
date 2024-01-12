import { Reviews, Students } from '../../db/schema';

export const findStudentById = async (id: string) => {
  const student = await Students.findOne({ _id: id }).exec();
  return student;
};

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

export const removeReview = async (reviewId: string) => {
  await Reviews.deleteOne({ _id: reviewId });
};

export const updateReviewVisibility = async (
  reviewId: string,
  reported: number,
  visible: number,
) => {
  await Reviews.updateOne(
    { _id: reviewId },
    { $set: { visible: visible, reported: reported } },
  );
};

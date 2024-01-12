/* eslint-disable implicit-arrow-linebreak */
import { Classes, ReviewDocument, Reviews, Students } from '../../db/schema';
import { UpdateCourseMetrics } from './admin.type';

export const findStudentById = async (id: string) => {
  const student = await Students.findOne({ _id: id }).exec();
  return student;
};

export const updateCourseMetrics = async (
  review: ReviewDocument,
  state: UpdateCourseMetrics,
) => {
  await Classes.updateOne(
    { _id: review.class },
    {
      $set: {
        classDifficulty:
          state.diff !== null && !isNaN(state.diff) ? state.diff : null,
        classRating:
          state.rating !== null && !isNaN(state.rating) ? state.rating : null,
        classWorkload:
          state.workload !== null && !isNaN(state.workload)
            ? state.workload
            : null,
      },
    },
  );
};

export const findAllPendingReviews = async () =>
  await Reviews.find(
    { visible: 0 },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();

export const findAllReviewsAfterDate = async (date: Date) =>
  await Reviews.aggregate([
    { $match: { date: { $gte: date } } },
    { $sample: { size: 1 } },
  ]);

export const removeReview = async (reviewId: string) => {
  await Reviews.deleteOne({ _id: reviewId });
};

export const updateReviewVisibility = async (
  reviewId: string,
  reported: number,
  visible: number,
) => {
  await Reviews.updateOne({ _id: reviewId }, { $set: { visible, reported } });
};

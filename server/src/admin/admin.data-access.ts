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

// eslint-disable-next-line arrow-body-style
export const findAllReviewsAfterDate = async (date: Date) => {
  return Reviews.find({ date: { $gte: date }, reported: 0 });
};

export const removeReviewById = async (reviewId: string) => {
  await Reviews.deleteOne({ _id: reviewId });
};

export const updateReviewVisibility = async (
  reviewId: string,
  reported: number,
  visible: number,
) => {
  await Reviews.updateOne({ _id: reviewId }, { $set: { visible, reported } });
};

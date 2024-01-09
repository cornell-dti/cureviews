import { verifyToken } from '../auth/auth.controller';
import { addStudentReview } from '../profile/profile.controller';
import { Review } from './review';
import {
  findClassReviews,
  insertReview,
  updateReviewVisibility,
} from './review.data-access';
import { InsertReviewType } from './review.type';
import shortid from 'shortid';

export const reportReview = async (id: string) => {
  await updateReviewVisibility(id, 1, 0);
};

export const insertNewReview = async ({
  auth,
  courseId,
  review,
}: InsertReviewType) => {
  const verified = await verifyToken({ auth });

  if (verified === null) {
    return null;
  }

  const { netId, student } = verified;

  const reviews = await findClassReviews(courseId);

  if (!student) {
    return null;
  }

  if (reviews.find((v) => v.text === review.text)) {
    return null;
  }

  try {
    const newReview: Review = new Review({
      _id: shortid.generate(),
      text: review.text,
      difficulty: review.difficulty,
      rating: review.rating,
      workload: review.workload,
      class: courseId,
      date: new Date(),
      visible: 0,
      reported: 0,
      professors: review.professors,
      likes: 0,
      isCovid: review.isCovid,
      user: student._id,
      grade: review.grade,
      major: review.major,
    });

    await insertReview(newReview);
    await addStudentReview({ netId, reviewId: newReview.getReviewId() });

    return newReview;
  } catch (err) {
    return null;
  }
};

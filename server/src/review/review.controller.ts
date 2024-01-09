import { verifyToken } from '../auth/auth.controller';
import {
  addStudentReview,
  setStudentLikedReviews,
} from '../profile/profile.controller';
import { Review } from './review';
import {
  findClassReviews,
  findReview,
  insertReview,
  updateReviewLikes,
  updateReviewVisibility,
} from './review.data-access';
import { InsertReviewType, ReviewLikesType } from './review.type';
import shortid from 'shortid';

export const checkStudentHasLiked = async ({ auth, reviewId }) => {
  const verified = await verifyToken({ auth });

  if (verified === null) {
    return null;
  }

  const { netId, student } = verified;

  const review = await findReview(reviewId);

  if (!student) {
    return null;
  }

  if (!review) {
    return null;
  }

  if (student.likedReviews && student.likedReviews.includes(review.id)) {
    return true;
  } else {
    return false;
  }
};

export const updateStudentLiked = async ({
  auth,
  reviewId,
}: ReviewLikesType) => {
  const verified = await verifyToken({ auth });

  if (verified === null) {
    return null;
  }

  const { netId, student } = verified;

  const review = await findReview(reviewId);

  if (!student) {
    return null;
  }

  if (!review) {
    return null;
  }

  if (
    student.likedReviews !== undefined &&
    student.likedReviews.includes(review._id)
  ) {
    const result = await setStudentLikedReviews({
      netId,
      reviewId: review._id,
    });
    if (!result) {
      return null;
    }
    if (review.likes === undefined) {
      await updateReviewLikes(reviewId, 0, netId);
    } else {
      await updateReviewLikes(reviewId, Math.max(0, review.likes - 1), netId);
    }
  } else {
    await setStudentLikedReviews({ netId, reviewId: review._id });
    if (review.likes === undefined) {
      await updateReviewLikes(reviewId, 1, netId);
    } else {
      await updateReviewLikes(reviewId, review.likes + 1, netId);
    }
  }

  return review;
};

export const reportReview = async (id: string) => {
  try {
    await updateReviewVisibility(id, 1, 0);
    return true;
  } catch (err) {
    return false;
  }
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

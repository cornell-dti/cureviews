/* eslint-disable operator-linebreak */
import shortid from 'shortid';

import { findReview, findStudent } from '../utils';

import { Review } from './review';
import {
  findClassReviews,
  insertReview,
  updateReviewLikes,
  updateStudentLikedReviews,
  updateStudentReviews,
} from './review.data-access';
import {
  InsertReviewType,
  ReviewLikesType,
  SetStudentLikedReviewsType,
  AddStudentReviewType,
  VerifyAuthType,
  VerifyStudentType,
  TokenPayloadType,
  InsertStudentType,
} from './review.type';
import { insertNewStudent } from '../auth/auth.data-access';

export const insertUser = async ({ token }: TokenPayloadType) => {
  try {
    if (!token.email) {
      return false;
    }

    if (token.email.replace('@cornell.edu', '') !== null) {
      const user = await findStudent(token.email.replace('@cornell.edu', ''));

      if (user === null) {
        const newStudent: InsertStudentType = {
          _id: shortid.generate(),
          firstName: token.given_name ? token.given_name : '',
          lastName: token.family_name ? token.family_name : '',
          netId: token.email.replace('@cornell.edu', ''),
          affiliation: '',
          token: '',
          privilege: 'regular',
        };

        await insertNewStudent(newStudent);
      }
    }
  } catch (err) {
    return false;
  }

  return true;
};

export const verifyToken = async ({ auth }: VerifyAuthType) => {
  const ticket = await auth.getVerificationTicket();

  if (!ticket) {
    return null;
  }

  if (ticket.hd === 'cornell.edu') {
    if (!ticket.email) {
      return null;
    }
    const result = await insertUser({ token: ticket });

    if (!result) {
      return null;
    }

    const netId = ticket.email.replace('@cornell.edu', '');
    const student = await findStudent(netId);
    return { netId, student } as VerifyStudentType;
  }
  return null;
};

export const setStudentLikedReviews = async ({
  netId,
  reviewId,
  liked,
}: SetStudentLikedReviewsType) => {
  try {
    await updateStudentLikedReviews(netId, reviewId, liked);
  } catch (err) {
    return false;
  }

  return true;
};

export const addStudentReview = async ({
  netId,
  reviewId,
}: AddStudentReviewType) => {
  try {
    const student = await findStudent(netId);
    if (!student) {
      return false;
    }

    const { reviews } = student;

    const newReviews = reviews ? reviews.concat([reviewId]) : [reviewId];
    await updateStudentReviews(netId, newReviews);
  } catch (err) {
    return false;
  }

  return true;
};

export const checkStudentHasLiked = async ({
  auth,
  reviewId,
}: ReviewLikesType) => {
  const verified = await verifyToken({ auth });

  if (verified === null) {
    return null;
  }

  const { student } = verified;

  const review = await findReview(reviewId);

  if (!student) {
    return null;
  }

  if (!review) {
    return null;
  }

  if (student.likedReviews && student.likedReviews.includes(review.id)) {
    return true;
  }
  return false;
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
      liked: false,
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
    await setStudentLikedReviews({ netId, reviewId: review._id, liked: true });
    if (review.likes === undefined) {
      await updateReviewLikes(reviewId, 1, netId);
    } else {
      await updateReviewLikes(reviewId, review.likes + 1, netId);
    }
  }

  return review;
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

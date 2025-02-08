/* eslint-disable operator-linebreak */
import shortid from 'shortid';

import { findReview, findStudent, insertUser } from '../utils';

import { Review } from './review';
import {
  findClassReviews,
  insertReview,
  updateReviewLikedBy,
  updateStudentLikedReviews,
  updateStudentReviews,
  updateReviewLikes,
  hideReportedReview, updateStudentMajors
} from './review.data-access';
import {
  InsertReviewType,
  ReviewLikesType,
  SetStudentLikedReviewsType,
  AddStudentReviewType,
  VerifyAuthType,
  VerifyStudentType,
  SetReviewReportedType,
  GetPendingReviewsType,
} from './review.type';

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
  liked
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
  reviewId
}: AddStudentReviewType) => {
  try {
    const student = await findStudent(netId);
    if (!student) {
      return false;
    }

    const { reviews } = student;

    const review = await findReview(reviewId);
    if (student.majors !== review.major) {
      if (review.major && review.major.length !== 0) {
        await updateStudentMajors(netId, review.major);
      }
    }

    const newReviews = reviews ? reviews.concat([reviewId]) : [reviewId];
    await updateStudentReviews(netId, newReviews);
  } catch (err) {
    return false;
  }

  return true;
};

export const checkStudentHasLiked = async ({
  auth,
  reviewId
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
  reviewId
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
      liked: false
    });

    if (!result) {
      return null;
    }

    await updateReviewLikedBy(reviewId, student._id, false);
  } else {
    await setStudentLikedReviews({
      netId,
      reviewId: review._id,
      liked: true
    });

    await updateReviewLikedBy(reviewId, student._id, true);
  }

  const updatedReview = await findReview(reviewId);
  const uniqueLikes = new Set(updatedReview.likedBy);
  await updateReviewLikes(reviewId, uniqueLikes.size);

  return await findReview(reviewId);
};

export const insertNewReview = async ({
  auth,
  courseId,
  review
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
      major: review.major
    });

    const pendingReviews = await insertReview(newReview);
    await addStudentReview({ netId, reviewId: newReview.getReviewId() });

    return pendingReviews;
  } catch (err) {
    return null;
  }
};

/**
 * Controller method for reporting a review.
 * @param auth: an Auth token to verify the current user
 * @param reviewId: the _id string of a Review object, the Review must exist
 * @returns null if user is not verified, true if the review is successfully reported, false if unsuccessful
 */

export const setReviewReported = async ({
  auth,
  reviewId
}: SetReviewReportedType) => {
  const verified = await verifyToken({ auth });

  if (verified === null) {
    return null;
  }

  try {
    const review = await hideReportedReview(reviewId);
    return true;
  } catch {
    return false;
  }
};

import {
  updateStudentReviews,
  updateStudentLikedReviews,
  findReviewDocsByNetId,
} from "./profile.data-access";
import {
  ProfileInfoRequestType,
  ProfileLikeReviewType,
  ProfileReviewType,
} from "./profile.type";

import { findStudent } from "../utils";

export const getStudentReviewIds = async ({
  netId,
}: ProfileInfoRequestType) => {
  const student = await findStudent(netId);
  if (!student) return null;
  return student.reviews;
};

export const getTotalLikesByNetId = async ({
  netId,
}: ProfileInfoRequestType) => {
  let totalLikes = 0;
  const reviewDocs = await getStudentReviewDocs({ netId });

  if (!reviewDocs) {
    return null;
  }

  reviewDocs.forEach((review) => {
    if (review !== null) {
      totalLikes += review.likes ? review.likes : 0;
    }
  });

  return totalLikes;
};

export const getStudentReviewDocs = async ({
  netId,
}: ProfileInfoRequestType) => {
  const student = await findStudent(netId);

  if (!student) {
    return null;
  }

  const reviews = await findReviewDocsByNetId(netId);

  return reviews.filter((review) => review !== null);
};

export const addStudentReview = async ({
  netId,
  reviewId,
}: ProfileReviewType) => {
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

export const setStudentLikedReviews = async ({
  netId,
  reviewId,
  liked,
}: ProfileLikeReviewType) => {
  try {
    await updateStudentLikedReviews(netId, reviewId, liked);
  } catch (err) {
    return false;
  }

  return true;
};

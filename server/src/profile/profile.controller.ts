import {
  findReviewDoc,
  findStudent,
  updateStudentReviews,
  updateStudentLikedReviews,
} from './profile.data-access';
import {
  ProfileInfoType,
  ProfileLikeReviewType,
  ProfileReviewType,
} from './profile.type';

export const getStudentReviewIds = async ({ netId }: ProfileInfoType) => {
  const student = await findStudent(netId);
  if (!student) return null;
  return student.reviews;
};

export const getTotalLikesByNetId = async ({ netId }: ProfileInfoType) => {
  let totalLikes = 0;
  let reviewDocs = await getStudentReviewDocs({ netId });

  reviewDocs.forEach((review) => {
    if (review === null) return totalLikes;

    if ('likes' in review) {
      totalLikes += review.likes ? review.likes : 0;
    }
  });

  return totalLikes;
};

export const getStudentReviewDocs = async ({ netId }: ProfileInfoType) => {
  const student = await findStudent(netId);

  if (!student) {
    return [null];
  }

  const studentReviewIds = student.reviews;

  if (!studentReviewIds) {
    return [];
  }

  let reviews = await Promise.all(
    studentReviewIds.map(async (reviewId) => await findReviewDoc(reviewId)),
  );

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

    const reviews = student.reviews;

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
}: ProfileLikeReviewType) => {
  try {
    await updateStudentLikedReviews(netId, reviewId);
  } catch (err) {
    return false;
  }

  return true;
};
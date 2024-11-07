import { findReviewDocsById } from './profile.data-access';
import { ProfileInfoRequestType } from './profile.type';

import { findStudent } from '../utils';

export const getStudentReviewIds = async ({
  netId
}: ProfileInfoRequestType) => {
  const student = await findStudent(netId);
  if (!student) return null;
  return student.reviews;
};

export const getTotalLikesByNetId = async ({
  netId
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
  netId
}: ProfileInfoRequestType) => {
  const student = await findStudent(netId);

  if (!student) {
    return null;
  }

  const reviews = await findReviewDocsById(student._id);
  return reviews.filter((review) => review !== null);
};

import { findReviewDoc, findStudent } from './profile.data-access';

export const getStudentReviewIds = async (netId: string) => {
  const student = await findStudent(netId);
  if (!student) return null;
  return student.reviews;
};

export const getTotalLikesByNetId = async (netId: string) => {
  let totalLikes = 0;
  let reviewDocs = await getStudentReviewDocs(netId);

  reviewDocs.forEach((review) => {
    if ('likes' in review) {
      totalLikes += review.likes;
    }
  });

  return totalLikes;
};

export const getStudentReviewDocs = async (netId: string) => {
  const student = await findStudent(netId);
  const studentReviewIds = student.reviews;

  if (!studentReviewIds) {
    return [];
  }

  let reviews = await Promise.all(
    studentReviewIds.map(async (reviewId) => await findReviewDoc(reviewId)),
  );

  return reviews.filter((review) => review !== null);
};

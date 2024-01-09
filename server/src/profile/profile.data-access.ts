import { Reviews, Students } from '../../db/schema';

export const findStudent = async (netId: string) => {
  const student = await Students.findOne({ netId }).exec();
  return student;
};

export const findReviewDoc = async (reviewId: string) => {
  const review = await Reviews.findOne({ _id: reviewId }).exec();
  return review;
};

export const insertNewStudent = async (studentDoc) => {
  const newStudent = new Students(studentDoc);

  await newStudent.save();
};

export const updateStudentReviews = async (
  netId: string,
  newReviews: string[],
) => {
  await Students.updateOne({ netId }, { $set: { reviews: newReviews } }).exec();
};

export const updateStudentLikedReviews = async (
  netId: string,
  reviewId: string,
) => {
  await Students.updateOne(
    { netId },
    { $pull: { likedReviews: reviewId } },
  ).exec();
};

import { Reviews, Students } from '../../db/schema';

export const findReviewDocsByNetId = async (netId: string) => {
  const reviews = await Reviews.find({ user: netId }).exec();
  return reviews;
};

export const findStudent = async (netId: string) => {
  const student = await Students.findOne({ netId }).exec();
  return student;
};

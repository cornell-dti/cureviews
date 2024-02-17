import { Reviews, Students } from '../db/schema.js';

export const findReviewDocsById = async (id: string) => {
  const reviews = await Reviews.find({ user: id }).exec();
  return reviews;
};

export const findStudent = async (netId: string) => {
  const student = await Students.findOne({ netId }).exec();
  return student;
};

import { Students } from "../../db/schema";

export const findStudent = async (netId: string) => {
  const student = await Students.findOne({ netId }).exec();
  return student;
};

import { Students } from '../../db/schema';

export const insertNewStudent = async (studentDoc) => {
  const newStudent = new Students(studentDoc);

  await newStudent.save();
};

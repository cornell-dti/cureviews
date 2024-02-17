import { Students } from '../db/schema.js';

export const insertNewStudent = async (studentDoc) => {
  const newStudent = new Students(studentDoc);

  await newStudent.save();
};

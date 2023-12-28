import { Classes, Subjects, Professors } from '../../db/schema';

export const findAllCourses = async () => {
  return Classes.find({
    sort: { classFull: 1 },
    limit: 200,
    reactive: false,
  }).exec();
};

export const findCourses = async (query: string) => {
  return await Classes.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } },
    { sort: { score: { $meta: 'textScore' } } },
  ).exec();
};

export const findCoursesByNum = async (query: string) => {
  const courses = await Classes.find(
    { classNum: { $regex: `.*${query}.*`, $options: 'i' } },
    {},
    { sort: { classFull: 1 }, limit: 200, reactive: false },
  ).exec();
  return courses;
};

export const findCourseWithinSubject = async (
  subject: string,
  query: string,
) => {
  return await Classes.find(
    {
      classSub: subject,
      classFull: { $regex: `.*${query}.*`, $options: 'i' },
    },
    { sort: { classFull: 1 }, limit: 200, reactive: false },
  ).exec();
};

export const findCourseSubject = async (query: string) => {
  return await Classes.find(
    { classSub: query },
    { sort: { classFull: 1 }, limit: 200, reactive: false },
  ).exec();
};

export const findSubjects = async (query: string) => {
  return await Subjects.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } },
    { sort: { score: { $meta: 'textScore' } } },
  ).exec();
};

export const findProfessors = async (query: string) => {
  return await Professors.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } },
    { sort: { score: { $meta: 'textScore' } } },
  ).exec();
};

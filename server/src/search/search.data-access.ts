import { Classes, Subjects, Professors } from '../../db/schema';

export const findCourses = async (query: string) => {
  return await Classes.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } },
    { sort: { score: { $meta: 'textScore' } } },
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

/* eslint-disable implicit-arrow-linebreak */
import { Classes, Subjects, Professors } from '../../db/schema';

export const findCourses = async (query: string) =>
  await Classes.find({ $text: { $search: query } }).exec();

export const findCoursesByNum = async (query: string) => {
  const courses = await Classes.find({
    classNum: { $regex: `.*${query}.*`, $options: 'i' },
  }).exec();

  return courses;
};

export const findCourseWithinSubject = async (subject: string, query: string) =>
  await Classes.find({
    classSub: subject,
    classFull: { $regex: `.*${query}.*`, $options: 'i' },
  }).exec();

export const findCourseSubject = async (query: string) =>
  await Classes.find({ classSub: query }).exec();

export const findCourseProfessor = async (query: string) =>
  Classes.find({
    classProfessors: { $regex: query.replace('+', '.*.'), $options: 'i' },
  }).exec();

export const findSubjects = async (query: string) =>
  await Subjects.find({ $text: { $search: query } }).exec();

export const findProfessors = async (query: string) =>
  await Professors.find({ $text: { $search: query } }).exec();

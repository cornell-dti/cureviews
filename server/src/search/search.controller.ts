import {
  findCourseSubject,
  findCourses,
  findCoursesByNum,
  findProfessors,
  findSubjects,
  findCourseWithinSubject,
  findAllCourses,
} from './search.data-access';
import { SearchQueryType } from './search.type';

const regexCourseSearch = async ({ search }: SearchQueryType) => {
  const query = search.getQuery();
  const indexFirstDigit = search.getFirstDigit();

  if (query !== undefined && query !== '') {
    // check if first digit is a number. Catches searchs like "1100"
    // if so, search only through the course numbers and return classes ordered by full name
    if (indexFirstDigit === 0) {
      return await findCoursesByNum(query);
    }
  }

  // check if query is a subject, if so return only classes with this subject. Catches searches like "CS"
  const courseSubject = await findCourseSubject(query);
  if (courseSubject) {
    return courseSubject;
  }

  // check if text before space is subject, if so search only classes with this subject.
  // Speeds up searches like "CS 1110"
  const indexFirstSpace = search.getFirstSpace();
  if (indexFirstSpace !== -1) {
    const strBeforeSpace = query.substring(0, indexFirstSpace);
    const strAfterSpace = query.substring(indexFirstSpace + 1);
    const subject = await findCourseSubject(strBeforeSpace);
    if (subject) {
      return await findCourseWithinSubject(strBeforeSpace, strAfterSpace);
    }
  }

  // check if text is subject followed by course number (no space)
  // if so search only classes with this subject.
  // Speeds up searches like "CS1110"
  if (indexFirstDigit !== -1) {
    const strBeforeDigit = query.substring(0, indexFirstDigit);
    const strAfterDigit = query.substring(indexFirstDigit);
    const subject = await findCourseSubject(strBeforeDigit);

    if (subject) {
      return await findCourseWithinSubject(strBeforeDigit, strAfterDigit);
    }
  }

  return findAllCourses();
};

export const searchCourses = async ({ search }: SearchQueryType) => {
  const courses = await search.searchQuery(findCourses);
  if (courses && courses.length > 0) {
    return courses;
  }

  return await regexCourseSearch({ search });
};

export const searchSubjects = async ({ search }: SearchQueryType) => {
  const subjects = await search.searchQuery(findSubjects);
  return subjects;
};

export const searchProfessors = async ({ search }: SearchQueryType) => {
  const professors = await search.searchQuery(findProfessors);
  return professors;
};

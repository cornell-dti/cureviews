import { courseSort } from './search.algo';
import {
  findCourseSubject,
  findCourses,
  findCoursesByNum,
  findProfessors,
  findSubjects,
  findCourseWithinSubject,
  findCourseProfessor,
} from './search.data-access';
import { SearchQueryType } from './search.type';

const fullCourseSearch = async ({ search }: SearchQueryType) => {
  const query = search.getQuery();
  let fullSearch = new Set();

  if (query !== undefined && query !== '') {
    // check if text before space is subject, if so search only classes with this subject.
    // Speeds up searches like "CS 1110"

    const initialSearch = await search.searchQuery(findCourses);

    if (initialSearch && initialSearch.length > 0) {
      fullSearch = new Set([...fullSearch, ...initialSearch]);
    }

    const coursesByProfessor = await search.searchQuery(findCourseProfessor);
    if (coursesByProfessor && coursesByProfessor.length > 0) {
      fullSearch = new Set([...fullSearch, ...coursesByProfessor]);
    }

    const indexFirstSpace = search.getFirstSpace();
    if (indexFirstSpace !== -1) {
      const strBeforeSpace = query.substring(0, indexFirstSpace);
      const strAfterSpace = query.substring(indexFirstSpace + 1);
      const subject = await findCourseSubject(strBeforeSpace);
      if (subject) {
        const coursesWithinSubject = await findCourseWithinSubject(
          strBeforeSpace,
          strAfterSpace,
        );

        fullSearch = new Set([...fullSearch, ...coursesWithinSubject]);
      }
    }

    // check if text is subject followed by course number (no space)
    // if so search only classes with this subject.
    // Speeds up searches like "CS1110"
    const indexFirstDigit = search.getFirstDigit();

    if (indexFirstDigit !== -1) {
      const strBeforeDigit = query.substring(0, indexFirstDigit);
      const strAfterDigit = query.substring(indexFirstDigit);
      const subject = await findCourseSubject(strBeforeDigit);

      if (subject) {
        const result = await findCourseWithinSubject(
          strBeforeDigit,
          strAfterDigit,
        );

        fullSearch = new Set([...fullSearch, ...result]);
      }
    }

    // check if first digit is a number. Catches searchs like "1100"
    // if so, search only through the course numbers and return classes ordered by full name
    if (indexFirstDigit === 0) {
      const courses = await findCoursesByNum(query);
      fullSearch = new Set([...fullSearch, ...courses]);
    }

    // check if query is a subject, if so return only classes with this subject. Catches searches like "CS"
    const courseSubject = await findCourseSubject(query);
    if (courseSubject.length > 0) {
      fullSearch = new Set([...fullSearch, ...courseSubject]);
    }
  }

  return fullSearch;
};

export const searchCourses = async ({ search }: SearchQueryType) => {
  try {
    const fullSearch = await fullCourseSearch({ search });

    if (fullSearch.size > 200 && fullSearch.size > 0) {
      return Array.from(fullSearch)
        .slice(0, 200)
        .sort(courseSort(search.getQuery()));
    }

    return Array.from(fullSearch).sort(courseSort(search.getQuery()));
  } catch (e) {
    return null;
  }
};

export const searchCoursesByProfessor = async ({ search }: SearchQueryType) => {
  try {
    const courses = await search.searchQuery(findCourseProfessor);
    if (courses && courses.length > 0) {
      return courses.sort(courseSort(search.getQuery()));
    }

    return [];
  } catch (e) {
    return null;
  }
};

export const searchCoursesBySubject = async ({ search }: SearchQueryType) => {
  try {
    const courses = await search.searchQuery(findCourseSubject);
    if (courses && courses.length > 0) {
      return courses.sort(courseSort(search.getQuery()));
    }

    return [];
  } catch (e) {
    return null;
  }
};

export const searchSubjects = async ({ search }: SearchQueryType) => {
  try {
    const subjects = await search.searchQuery(findSubjects);
    return subjects;
  } catch (e) {
    return null;
  }
};

export const searchProfessors = async ({ search }: SearchQueryType) => {
  try {
    const professors = await search.searchQuery(findProfessors);
    return professors;
  } catch (e) {
    return null;
  }
};

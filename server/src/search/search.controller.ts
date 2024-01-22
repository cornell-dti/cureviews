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

/**
 * Searches database for all relevant courses based on query.
 * Returns at most 200 relevant courses based on edit distance.
 *
 * @param {Search} search: Object that represents the search of a request being passed in.
 * @returns list of courses if operation was successful, null otherwise.
 */
const fullCourseSearch = async ({ search }: SearchQueryType) => {
  const query = search.getQuery();
  let fullSearch = new Set(); // set to ensure no duplicate courses

  if (query !== undefined && query !== '') {
    // naive search
    const initialSearch = await search.searchQuery(findCourses);

    if (initialSearch && initialSearch.length > 0) {
      fullSearch = new Set([...fullSearch, ...initialSearch]);
    }

    // checks if search is a professor
    // returns all courses taught by particular professor
    const coursesByProfessor = await search.searchQuery(findCourseProfessor);
    if (coursesByProfessor && coursesByProfessor.length > 0) {
      return new Set(coursesByProfessor);
    }

    // check if query is a subject, if so return only classes with this subject. Catches searches like "CS"
    const courseSubject = await findCourseSubject(query);
    if (courseSubject.length > 0) {
      return new Set(courseSubject);
    }

    // check if first digit is a number. Catches searchs like "1100"
    // if so, search only through the course numbers and return classes ordered by full name
    const indexFirstDigit = search.getFirstDigit();
    if (indexFirstDigit === 0) {
      const courses = await findCoursesByNum(query);
      return new Set(courses);
    }

    // check if text before space is subject, if so search only classes with this subject.
    // Speeds up searches like "CS 1110"
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

        return new Set(coursesWithinSubject);
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
        const result = await findCourseWithinSubject(
          strBeforeDigit,
          strAfterDigit,
        );

        return new Set(result);
      }
    }
  }

  return fullSearch;
};

/**
 * Searches database for all relevant courses based on query.
 * Returns at most 200 relevant courses based on edit distance.
 *
 * @param {Search} search: Object that represents the search of a request being passed in.
 * @returns list of courses if operation was successful, null otherwise.
 */
export const searchCourses = async ({ search }: SearchQueryType) => {
  try {
    const fullSearch = await fullCourseSearch({ search });
    const sorted = Array.from(fullSearch).sort(courseSort(search.getQuery()));

    if (fullSearch.size > 200 && fullSearch.size > 0) {
      return sorted.slice(0, 200);
    }

    return sorted;
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

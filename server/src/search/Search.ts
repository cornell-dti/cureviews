import { body } from 'express-validator';

import { Context, Endpoint } from '../../endpoints';
import { Classes, Subjects, Professors } from '../../db/schema';

// The type for a search query
interface Search {
  query: string;
}

/*
 * These utility methods are taken from methods.ts
 * Thanks again Dray!
 */

// uses levenshtein algorithm to return the minimum edit distance between two strings.
// It is exposed here for testing
export const editDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  let j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1,
          ),
        ); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

// a wrapper for a comparator function to be used to sort courses by comparing their edit distance with the query
const courseSort = (query) => (a, b) => {
  const aCourseStr = `${a.classSub} ${a.classNum}`;
  const bCourseStr = `${b.classSub} ${b.classNum}`;
  const queryLen = query.length;
  return (
    editDistance(query.toLowerCase(), aCourseStr.slice(0, queryLen)) -
    editDistance(query.toLowerCase(), bCourseStr.slice(0, queryLen))
  );
};

// Helper to check if a string is a subject code
// exposed for testing
export const isSubShorthand = async (sub: string) => {
  const subCheck = await Subjects.find({ subShort: sub }).exec();
  return subCheck.length > 0;
};

// helper to format search within a subject
const searchWithinSubject = (sub: string, remainder: string) =>
  Classes.find(
    {
      classSub: sub,
      classFull: { $regex: `.*${remainder}.*`, $options: '-i' },
    },
    {},
    { sort: { classFull: 1 }, limit: 200, reactive: false },
  ).exec();

export const regexClassesSearch = async (searchString) => {
  try {
    if (searchString !== undefined && searchString !== '') {
      // check if first digit is a number. Catches searchs like "1100"
      // if so, search only through the course numbers and return classes ordered by full name
      const indexFirstDigit = searchString.search(/\d/);
      if (indexFirstDigit === 0) {
        // console.log("only numbers")
        return Classes.find(
          { classNum: { $regex: `.*${searchString}.*`, $options: '-i' } },
          {},
          { sort: { classFull: 1 }, limit: 200, reactive: false },
        )
          .exec()
          .then((classes) => classes.sort(courseSort(searchString)));
      }

      // check if searchString is a subject, if so return only classes with this subject. Catches searches like "CS"
      if (await isSubShorthand(searchString)) {
        return Classes.find(
          { classSub: searchString },
          {},
          { sort: { classFull: 1 }, limit: 200, reactive: false },
        ).exec();
      }
      // check if text before space is subject, if so search only classes with this subject.
      // Speeds up searches like "CS 1110"
      const indexFirstSpace = searchString.search(' ');
      if (indexFirstSpace !== -1) {
        const strBeforeSpace = searchString.substring(0, indexFirstSpace);
        const strAfterSpace = searchString.substring(indexFirstSpace + 1);
        if (await isSubShorthand(strBeforeSpace)) {
          // console.log("matches subject with space: " + strBeforeSpace)
          return await searchWithinSubject(strBeforeSpace, strAfterSpace);
        }
      }

      // check if text is subject followed by course number (no space)
      // if so search only classes with this subject.
      // Speeds up searches like "CS1110"
      if (indexFirstDigit !== -1) {
        const strBeforeDigit = searchString.substring(0, indexFirstDigit);
        const strAfterDigit = searchString.substring(indexFirstDigit);
        if (await isSubShorthand(strBeforeDigit)) {
          // console.log("matches subject with digit: " + String(strBeforeDigit))
          return await searchWithinSubject(strBeforeDigit, strAfterDigit);
        }
      }

      // last resort, search everything
      // console.log("nothing matches");
      return Classes.find(
        { classFull: { $regex: `.*${searchString}.*`, $options: '-i' } },
        {},
        { sort: { classFull: 1 }, limit: 200, reactive: false },
      ).exec();
    }
    // console.log("no search");
    return Classes.find(
      {},
      {},
      { sort: { classFull: 1 }, limit: 200, reactive: false },
    ).exec();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getClassesByQuery' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
};

/*
 * Query for classes using a query
 */
export const getClassesByQuery: Endpoint<Search> = {
  guard: [body('query').notEmpty()],
  callback: async (ctx: Context, search: Search) => {
    // Filter by not-whitespace, then match any not word.
    const query = search.query.replace(/(?=[^\s])\W/g, '');
    try {
      const classes = await Classes.find(
        { $text: { $search: search.query } },
        { score: { $meta: 'textScore' } },
        { sort: { score: { $meta: 'textScore' } } },
      ).exec();
      if (classes && classes.length > 0) {
        return classes.sort(courseSort(query));
      }
      return await regexClassesSearch(query);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getClassesByQuery' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: 'Internal Server Error' };
    }
  },
};

/*
 * Searches the database on Subjects using the text index and returns matching subjects
 */
export const getSubjectsByQuery: Endpoint<Search> = {
  guard: [body('query').notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      return await Subjects.find(
        { $text: { $search: search.query } },
        { score: { $meta: 'textScore' } },
        { sort: { score: { $meta: 'textScore' } } },
      ).exec();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getSubjectsByQuery' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: 'Internal Server Error' };
    }
  },
};

/*
 * Searches the database on Professors using the text index and returns matching professors
 */
export const getProfessorsByQuery: Endpoint<Search> = {
  guard: [body('query').notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      return await Professors.find(
        { $text: { $search: search.query } },
        { score: { $meta: 'textScore' } },
        { sort: { score: { $meta: 'textScore' } } },
      ).exec();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getProfessorsByQuery' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: 'Internal Server Error' };
    }
  },
};

export const getCoursesByMajor: Endpoint<Search> = {
  guard: [body('query').notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      let courses = [];
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(search.query)) {
        courses = await Classes.find({ classSub: search.query }).exec();
      }
      return courses;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getCoursesByMajor' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: 'Internal Server Error' };
    }
  },
};

export const getCoursesByProfessor: Endpoint<Search> = {
  guard: [body('query').notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      let courses = [];
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(search.query)) {
        const professorRegex = search.query.replace('+', '.*.');
        courses = await Classes.find({
          classProfessors: { $regex: professorRegex, $options: 'i' },
        }).exec();
      }
      return courses;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getCoursesByProfessor' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: 'Internal Server Error' };
    }
  },
};

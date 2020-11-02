import { body } from "express-validator";

import { Endpoint } from "../endpoints";
import { Classes } from "../dbDefs";

// The type for a search query
interface Search {
    query: string;
}

/*
 * These utility methods are taken from methods.ts
 * Thanks again Dray!
 */

// uses levenshtein algorithm to return the minimum edit distance between two strings
// exposed for testing
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
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1)); // deletion
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
  return editDistance(query.toLowerCase(), aCourseStr.slice(0, queryLen))
      - editDistance(query.toLowerCase(), bCourseStr.slice(0, queryLen));
};

/*
 * Query for classes using a query
 */
export const getClassesByQuery: Endpoint<Search> = {
  guard: [body("query").notEmpty().isAscii()],
  callback: async (search: Search) => {
    try {
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(search.query)) {
        const classes = await Classes.find({ $text: { $search: search.query } }, { score: { $meta: "textScore" } }, { sort: { score: { $meta: "textScore" } } }).exec();
        return classes.sort(courseSort(search.query));
      }
      return { error: "Malformed Query" };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getClassesByQuery' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

/*
 * These utility methods are taken from methods.ts
 * Thanks again Dray!
 */

// uses levenshtein algorithm to return the minimum edit distance between two strings.
// It is exposed here for testing
const editDistance = (a, b) => {
  const len_a = a ? a.length : 0;
  const len_b = b ? b.length : 0;

  if (len_a === 0) {
    return len_b;
  }
  if (len_b === 0) {
    return len_a;
  }

  const matrix = new Array<number[]>(len_b + 1);
  for (let i = 0; i <= len_b; ++i) {
    let row = (matrix[i] = new Array<number>(len_a + 1));
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= len_a; ++j) {
    firstRow[j] = j;
  }

  for (let i = 1; i <= len_b; ++i) {
    for (let j = 1; j <= len_a; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1], // substitution
            matrix[i][j - 1], // insertion
            matrix[i - 1][j], // deletion
          ) + 1;
      }
    }
  }

  return matrix[len_b][len_a];
};

// a wrapper for a comparator function to be used to sort courses by comparing their edit distance with the query
export const courseSort = (query) => (a, b) => {
  const aCourseStr = `${a.classSub} ${a.classNum}`;
  const bCourseStr = `${b.classSub} ${b.classNum}`;
  const queryLen = query.length;
  return (
    editDistance(query.toLowerCase(), aCourseStr.slice(0, queryLen)) -
    editDistance(query.toLowerCase(), bCourseStr.slice(0, queryLen))
  );
};

/*
 * These utility methods are taken from methods.ts
 * Thanks again Dray!
 */

// uses levenshtein algorithm to return the minimum edit distance between two strings.
// It is exposed here for testing
const editDistance = (a, b) => {
  const lenA = a ? a.length : 0;
  const lenB = b ? b.length : 0;

  if (lenA === 0) {
    return lenB;
  }
  if (lenB === 0) {
    return lenA;
  }

  const matrix = new Array<number[]>(lenB + 1);

  for (let i = 0; i <= lenB; i++) {
    matrix[i] = new Array<number>(lenA + 1);
    const row = matrix[i];
    row[0] = i;
  }
  for (let j = 1; j <= lenA; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1], // substitution
            matrix[i][j - 1], // insertion
            matrix[i - 1][j] // deletion
          ) + 1;
      }
    }
  }

  return matrix[lenB][lenA];
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

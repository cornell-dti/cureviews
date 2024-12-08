/*
  Additonal functions used in the CourseCard component.
*/

/**
 * Helper function to convert semester abbreviations to a full word
 */
export function semAbbriviationToWord(sem) {
  switch (sem) {
    case 'SP':
      return 'Spring';
    case 'FA':
      return 'Fall';
    case 'SU':
      return 'Summer';
    case 'WI':
      return 'Winter';
    default:
      return '';
  }
}

/**
 * Get a human-readable string representing a list of [up to] the last 2 semesters this class was offered.
 */
export function lastOfferedSems(theClass) {
  const offered = new Set();

  theClass.classSems.forEach((sem) => {
    offered.add(semAbbriviationToWord(sem.slice(0, -2)));
  });

  const semOrder = ['Fall', 'Spring', 'Summer', 'Winter'];

  const sortedSemesters = Array.from(offered).sort((a, b) => {
    return semOrder.indexOf(a) - semOrder.indexOf(b);
  });
  return sortedSemesters.join(', ');
}

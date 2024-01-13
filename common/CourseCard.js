/*
  Additonal functions used in the CourseCard component.
*/

// helper function to convert semester abbreviations to a full word
function semAbbriviationToWord(sem) {
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

// Get a human-readable string representing a list of [up to] the last 2 semesters this class was offered.
function lastOfferedSems(theClass) {
  const offered = new Set();

  theClass.classSems.forEach((sem) => {
    offered.add(semAbbriviationToWord(sem.slice(0, -2)));
  });
  // Array.from(offered).join(' ');
  return Array.from(offered).join(', ');
}

module.exports = {
  lastOfferedSems,
  semAbbriviationToWord,
};

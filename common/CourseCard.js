/*
  Additonal functions used in the CourseCard component.
*/

import { CURRENT_SEMESTER } from './constants';

export const SEMESTER_FORMAT = new RegExp('^(SP|SU|WI|FA)\\d{2}$');

/**
 * Helper function to convert semester abbreviations to a full word
 */
export function semAbbreviationToWord(sem) {
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
 * Return full semester label -- eg. "FA20" --> "Fall 2020".
 * Assumes 21st century (probably safe for now).
 * @param sem abbreviated semester text
 */
export function convertSemAbbreviation(sem) {
  return SEMESTER_FORMAT.test(sem)
    ? semAbbreviationToWord(sem.substring(0, 2)) + " 20" + sem.substring(2)
    : sem
}

/**
 *  Comparison function for two semesters.
 *  Returns -1 if semOne is less than semTwo
 *           1 if semOne is greater than semTwo
 *           0 otherwise (if they are equal)
 */
export function compareSems(semOne, semTwo) {
  if (!SEMESTER_FORMAT.test(semOne) || !SEMESTER_FORMAT.test(semTwo)) {
    throw new Error("When comparing semesters, both must be in abbreviated semester format.")
  }

  const semOrder = ['WI', 'SP', 'SU', 'FA'];
  let semOneTermIndex = semOrder.indexOf(semOne.substring(0,2))
  let semOneYear = parseInt(semOne.substring(2))
  let semTwoTermIndex = semOrder.indexOf(semTwo.substring(0,2))
  let semTwoYear = parseInt(semTwo.substring(2))

  if (semOneYear < semTwoYear) return -1;
  if (semOneYear > semTwoYear) return 1;
  if (semOneTermIndex < semTwoTermIndex) return -1;
  if (semOneTermIndex > semTwoTermIndex) return 1;
  return 0;
}

/**
 *  Returns -1 if sem is less than current semester
 *           1 if sem is greater than current semester
 *           0 otherwise (if they are equal)
 */
export function compareWithCurrentSem(sem) {
  if (!SEMESTER_FORMAT.test(sem)) throw new Error("Semester must be in abbreviated format.")
  return compareSems(sem, CURRENT_SEMESTER)
}

export function isCurrentSem(sem) {
  return compareWithCurrentSem(sem) === 0;
}

/**
 * Get a human-readable string representing a list of [up to] the last 2 semesters this class was offered.
 */
export function lastOfferedSems(theClass) {
  const offered = new Set();

  theClass.classSems.forEach((sem) => {
    offered.add(semAbbreviationToWord(sem.slice(0, -2)));
  });

  const semOrder = ['Fall', 'Spring', 'Summer', 'Winter'];

  const sortedSemesters = Array.from(offered).sort((a, b) => {
    return semOrder.indexOf(a) - semOrder.indexOf(b);
  });
  return sortedSemesters.join(', ');
}

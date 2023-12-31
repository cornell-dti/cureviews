import { ScrapingInstructor, ScrapingClass } from './types';

export function isInstructorEqual(
  a: ScrapingInstructor,
  b: ScrapingInstructor,
) {
  return a.firstName === b.firstName && a.lastName === b.lastName;
}

/*
 * Extract an array of professors from the terribly deeply nested gunk that the api returns
 * There are guaranteed to be no duplicates!
 */
export function extractProfessors(course: ScrapingClass): ScrapingInstructor[] {
  const raw = course.enrollGroups.map((e) =>
    e.classSections.map((s) => s.meetings.map((m) => m.instructors)),
  );
  // flatmap does not work :(
  const f1: ScrapingInstructor[][][] = [];
  raw.forEach((r) => f1.push(...r));
  const f2: ScrapingInstructor[][] = [];
  f1.forEach((r) => f2.push(...r));
  const f3: ScrapingInstructor[] = [];
  f2.forEach((r) => f3.push(...r));

  const nonDuplicates: ScrapingInstructor[] = [];

  f3.forEach((inst) => {
    // check if there is another instructor in nonDuplicates already!
    if (nonDuplicates.filter((i) => isInstructorEqual(i, inst)).length === 0) {
      // push the instructor if not present
      nonDuplicates.push(inst);
    }
  });

  return nonDuplicates;
}

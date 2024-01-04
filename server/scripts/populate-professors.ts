import { ScrapingInstructor, ScrapingClass, ScrapingSubject } from './types';
import axios from 'axios';
import { fetchSubjects } from './populate-subjects';
import { fetchClassesForSubject } from './populate-courses';
import { Classes } from '../db/schema';

export function isInstructorEqual(
  a: ScrapingInstructor,
  b: ScrapingInstructor,
) {
  return a.firstName === b.firstName && a.lastName === b.lastName;
}

/*
 * Extract an array of professors from the terribly deeply nested gunk that the api returns
 * There are guaranaxios!
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

export async function resetProfessors(endpoint: string, semesters: string[]) {
  console.log('Resetting professors...');
  try {
    await Promise.all(
      await semesters.map(async (sem) => {
        const subjects = await fetchSubjects(endpoint, sem);
        console.log(`Retrieved all subjects...`);
        if (subjects) {
          await subjects.map(async (sub) => {
            const courses = await fetchClassesForSubject(endpoint, sem, sub);

            if (courses) {
              await courses.map(async (course) => {
                try {
                  const matchedCourse = await Classes.findOne({
                    classSub: course.subject.toLowerCase(),
                    classNum: course.catalogNbr,
                  }).exec();

                  console.log(matchedCourse);

                  if (matchedCourse) {
                    await Classes.update(
                      { _id: matchedCourse._id },
                      { $set: { classProfessors: [] } },
                    ).exec();
                  }

                  console.log(
                    `Reset professors for course ${course.subject}${course.catalogNbr}...`,
                  );
                } catch (err) {
                  console.log(err);
                  return false;
                }
              });
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      }),
    );

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

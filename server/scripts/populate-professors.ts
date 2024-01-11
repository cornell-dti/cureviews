import { ScrapingInstructor, ScrapingClass } from './types';
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

export async function addAllProfessors(semesters: string[]) {
  // You just want to go through all the classes in the Classes database and update the Professors field
  // Don't want to go through the semesters
  // Might want a helper function that returns that professors for you
  console.log('In updateProfessors method');
  for (const semester in semesters) {
    // get all classes in this semester
    // console.log(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`);
    try {
      await axios.get(
        `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`,
        { timeout: 30000 },
      );
    } catch (error) {
      console.log('Error in updateProfessors: 1');
      console.log(error);
      continue;
    }
    const result = await axios.get(
      `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`,
      { timeout: 30000 },
    );
    // console.log(result)
    if (result.status !== 200) {
      console.log('Error in updateProfessors: 2');
      console.log(result.status);
      continue;
    } else {
      const response = result.data;
      // console.log(response);
      const { subjects } = response.data; // array of the subjects
      for (const department in subjects) {
        // for every subject
        const parent = subjects[department];
        // console.log("https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject="+ parent.value)
        try {
          await axios.get(
            `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`,
            { timeout: 30000 },
          );
        } catch (error) {
          console.log('Error in updateProfessors: 3');
          console.log(error);
          return false;
        }
        const result2 = await axios.get(
          `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`,
          { timeout: 30000 },
        );
        if (result2.status !== 200) {
          console.log('Error in updateProfessors: 4');
          console.log(result2.status);
          return false;
        } else {
          const response2 = result2.data;
          const courses = response2.data.classes;

          // add each class to the Classes collection if it doesnt exist already
          for (const course in courses) {
            try {
              const matchedCourse = await Classes.findOne({
                classSub: courses[course].subject.toLowerCase(),
                classNum: courses[course].catalogNbr,
              }).exec();
              if (matchedCourse) {
                console.log(courses[course].subject);
                console.log(courses[course].catalogNbr);
                console.log('This is the matchedCourse');
                console.log(matchedCourse);

                let oldProfessors = matchedCourse.classProfessors;
                if (oldProfessors == undefined) {
                  oldProfessors = [];
                }
                console.log('This is the length of old profs');
                console.log(oldProfessors.length);
                const { classSections } = courses[course].enrollGroups[0]; // This returns an array
                for (const section in classSections) {
                  if (
                    classSections[section].ssrComponent == 'LEC' ||
                    classSections[section].ssrComponent == 'SEM'
                  ) {
                    // Checks to see if class has scheduled meetings before checking them
                    if (classSections[section].meetings.length > 0) {
                      const professors =
                        classSections[section].meetings[0].instructors;
                      // Checks to see if class has instructors before checking them
                      // Example of class without professors is:
                      // ASRC 3113 in FA16
                      // ASRC 3113 returns an empty array for professors
                      if (professors.length > 0) {
                        for (const professor in professors) {
                          const { firstName } = professors[professor];
                          const { lastName } = professors[professor];
                          const fullName = `${firstName} ${lastName}`;
                          if (!oldProfessors.includes(fullName)) {
                            oldProfessors.push(fullName);
                          }
                        }
                      } else {
                        console.log('This class does not have professors');
                      }
                    } else {
                      console.log(
                        'This class does not have meetings scheduled',
                      );
                    }
                  }
                }
                await Classes.updateOne(
                  { _id: matchedCourse._id },
                  { $set: { classProfessors: oldProfessors } },
                ).exec();
              }
            } catch (error) {
              console.log('Error in updateProfessors: 5');
              console.log(
                `Error on course ${courses[course].subject} ${courses[course].catalogNbr}`,
              );
              console.log(error);

              return false;
            }
          }
        }
      }
    }
  }

  console.log('Finished updateProfessors');
  return true;
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

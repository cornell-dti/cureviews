import axios from "axios";
import shortid from "shortid";
import { Classes, Subjects, Professors } from "./dbDefs";

export const defaultEndpoint = "https://classes.cornell.edu/api/2.0/";

// Represents a subject which is scraped
// Note: there's a load of additional information when we scrape it.
// It's not relevant, so we just ignore it for now.
export interface ScrapingSubject {
  descrformal: string; // Subject description, e.g. "Asian American Studies"
  value: string; // Subject code, e.g. "AAS"
}

// This only exists for compatibility with the API
export interface ScrapingInstructor {
  firstName: string;
  lastName: string;
}

// This only exists for compatibility with the API
export interface ScrapingMeeting {
  instructors: ScrapingInstructor[];
}

// This only exists for compatibility with the API
export interface ScrapingClassSection {
  ssrComponent: string; // i.e. LEC, SEM, DIS
  meetings: ScrapingMeeting[];
}

// This only exists for compatibility with the API
export interface ScrapingEnrollGroup {
  classSections: ScrapingClassSection[]; // what sections the class has
}

// Represents a class which is scraped
// Note: there's a load of additional information when we scrape it.
// It's not relevant, so we just ignore it for now.
export interface ScrapingClass {
  subject: string; // Short: e.g. "CS"
  catalogNbr: string; // e.g. 1110
  titleLong: string; // long variant of a title e.g. "Introduction to Computing Using Python"
  enrollGroups: ScrapingEnrollGroup[]; // specified by the API
}

/*
 * Fetch the class roster for a semester.
 * Returns the class roster on success, or null if there was an error.
 */
export async function fetchSubjects(
  endpoint: string,
  semester: string,
): Promise<ScrapingSubject[]> {
  const result = await axios.get(
    `${endpoint}config/subjects.json?roster=${semester}`,
    { timeout: 10000 },
  );
  if (result.status !== 200 || result.data.status !== "success") {
    console.log(
      `Error fetching ${semester} subjects! HTTP: ${result.statusText} SERV: ${result.data.status}`,
    );
    return null;
  }

  return result.data.data.subjects;
}

/*
 * Fetch all the classes for that semester/subject combination
 * Returns a list of classes on success, or null if there was an error.
 */
export async function fetchClassesForSubject(
  endpoint: string,
  semester: string,
  subject: ScrapingSubject,
): Promise<ScrapingClass[]> {
  const result = await axios.get(
    `${endpoint}search/classes.json?roster=${semester}&subject=${subject.value}`,
    { timeout: 10000 },
  );
  if (result.status !== 200 || result.data.status !== "success") {
    console.log(
      `Error fetching subject ${semester}-${subject.value} classes! HTTP: ${result.statusText} SERV: ${result.data.status}`,
    );
    return null;
  }

  return result.data.data.classes;
}

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
export function extractProfessors(clas: ScrapingClass): ScrapingInstructor[] {
  const raw = clas.enrollGroups.map((e) => e.classSections.map((s) => s.meetings.map((m) => m.instructors)));
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

/*
 * Fetch the relevant classes, and add them to the collections
 * Returns true on success, and false on failure.
 */
export async function fetchAddCourses(
  endpoint: string,
  semester: string,
): Promise<boolean> {
  const subjects = await fetchSubjects(endpoint, semester);

  const v1 = await Promise.all(
    subjects.map(async (subject) => {
      const subjectIfExists = await Subjects.findOne({
        subShort: subject.value.toLowerCase(),
      }).exec();

      if (!subjectIfExists) {
        console.log(`Adding new subject: ${subject.value}`);
        const res = await new Subjects({
          _id: shortid.generate(),
          subShort: subject.value.toLowerCase(),
          subFull: subject.descrformal,
        })
          .save()
          .catch((err) => {
            console.log(err);
            return null;
          });

        // db operation was not successful
        if (!res) {
          throw new Error();
        }
      }

      return true;
    }),
  ).catch((err) => null);

  if (!v1) {
    console.log("Something went wrong while updating subjects!");
    return false;
  }

  // Update the Classes in the db
  const v2 = await Promise.all(
    subjects.map(async (subject) => {
      const classes = await fetchClassesForSubject(endpoint, semester, subject);

      // skip if something went wrong fetching classes
      // it could be that there are not classes here (in tests, corresponds to FEDN)
      if (!classes) {
        return true;
      }

      // Update or add all the classes to the collection
      const v = await Promise.all(
        classes.map(async (cl) => {
          const classIfExists = await Classes.findOne({
            classSub: cl.subject.toLowerCase(),
            classNum: cl.catalogNbr,
          }).exec();
          const professors = extractProfessors(cl);

          // figure out if the professor already exist in the collection, if not, add to the collection
          // build a list of professor names to potentially add the the class
          const profs: string[] = await Promise.all(
            professors.map(async (p) => {
              // This has to be an atomic upset. Otherwise, this causes some race condition badness
              const professorIfExists = await Professors.findOneAndUpdate(
                { fullName: `${p.firstName} ${p.lastName}` },
                {
                  $setOnInsert: {
                    fullName: `${p.firstName} ${p.lastName}`,
                    _id: shortid.generate(),
                    major: "None" /* TODO: change? */,
                  },
                },
                { upsert: true, new: true },
              );

              return professorIfExists.fullName;
            }),
          ).catch((err) => {
            console.log(err);
            return [];
          });

          // The class does not exist yet, so we add it
          if (!classIfExists) {
            console.log(`Adding new class ${cl.subject} ${cl.catalogNbr}`);
            const res = await new Classes({
              _id: shortid.generate(),
              classSub: cl.subject.toLowerCase(),
              classNum: cl.catalogNbr,
              classTitle: cl.titleLong,
              classFull: `${cl.subject.toLowerCase()} ${cl.catalogNbr} ${
                cl.titleLong
              }`,
              classSems: [semester],
              classProfessors: profs,
              classRating: null,
              classWorkload: null,
              classDifficulty: null,
            })
              .save()
              .catch((err) => {
                console.log(err);
                return null;
              });

            // update professors with new class information
            profs.forEach(async (inst) => {
              await Professors.findOneAndUpdate(
                { fullName: inst },
                { $addToSet: { courses: res._id } },
              ).catch((err) => console.log(err));
            });

            if (!res) {
              console.log(
                `Unable to insert class ${cl.subject} ${cl.catalogNbr}!`,
              );
              throw new Error();
            }
          } else {
            // The class does exist, so we update semester information
            console.log(
              `Updating class information for ${classIfExists.classSub} ${classIfExists.classNum}`,
            );

            // Compute the new set of semesters for this class
            const classSems = classIfExists.classSems.indexOf(semester) === -1
              ? classIfExists.classSems.concat([semester])
              : classIfExists.classSems;

            // Compute the new set of professors for this class
            const classProfessors = classIfExists.classProfessors
              ? classIfExists.classProfessors
              : [];

            // Add any new professors to the class
            profs.forEach((inst) => {
              if (classProfessors.filter((i) => i === inst).length === 0) {
                classProfessors.push(inst);
              }
            });

            // update db with new semester information
            const res = await Classes.findOneAndUpdate(
              { _id: classIfExists._id },
              { $set: { classSems, classProfessors } },
            )
              .exec()
              .catch((err) => {
                console.log(err);
                return null;
              });

            // update professors with new class information
            // Note the set update. We don't want to add duplicates here
            classProfessors.forEach(async (inst) => {
              await Professors.findOneAndUpdate(
                { fullName: inst },
                { $addToSet: { courses: classIfExists._id } },
              ).catch((err) => console.log(err));
            });

            if (!res) {
              console.log(
                `Unable to update class information for ${cl.subject} ${cl.catalogNbr}!`,
              );
              throw new Error();
            }
          }

          return true;
        }),
      ).catch((err) => {
        console.log(err);
        return null;
      });

      // something went wrong updating classes
      if (!v) {
        throw new Error();
      }

      return true;
    }),
  ).catch((err) => null);

  if (!v2) {
    console.log("Something went wrong while updating classes");
    return false;
  }

  return true;
}

/*
  Course API scraper. Uses HTTP requests to get course data from the Cornell
  Course API and stores the results in the local database.

  Functions defined here should be called during app initialization to populate
  the local database or once a semester to add new semester data to the
  local database.

  Functions are called by admins via the admin interface (Admin component).

*/

/* # Populates the Classes and Subjects collections in the local database by grabbing
   # all courses data for the semesters in the semsters array though requests
   # sent to the Cornell Courses API
   #
   # example: semesters = ["SP17", "SP16", "SP15","FA17", "FA16", "FA15"];
   #
   # Using the findAllSemesters() array as input, the function populates an
   # empty database with all courses and subjects.
   # Using findCurrSemester(), the function updates the existing database.
   #
*/
export async function addAllCourses(semesters: any) {
  console.log(semesters);
  Object.keys(semesters).forEach(async (semester) => {
    // get all classes in this semester
    console.log(
      `Adding classes for the following semester: ${semesters[semester]}`,
    );
    const result = await axios.get(
      `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`,
      { timeout: 30000 },
    );
    if (result.status !== 200) {
      console.log("Error in addAllCourses: 1");
      return 0;
    }
    const response = result.data;
    // console.log(response);
    const sub = response.data.subjects;
    await Promise.all(
      Object.keys(sub).map(async (course) => {
        const parent = sub[course];
        // if subject doesn't exist add to Subjects collection
        const checkSub = await Subjects.find({
          subShort: parent.value.toLowerCase(),
        }).exec();
        if (checkSub.length === 0) {
          console.log(`new subject: ${parent.value}`);
          await new Subjects({
            subShort: parent.value.toLowerCase(),
            subFull: parent.descr,
          }).save();
        }

        // for each subject, get all classes in that subject for this semester
        const result2 = await axios.get(
          `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`,
          { timeout: 30000 },
        );
        if (result2.status !== 200) {
          console.log("Error in addAllCourses: 2");
          return 0;
        }
        const response2 = result2.data;
        const courses = response2.data.classes;

        // add each class to the Classes collection if it doesnt exist already
        for (const course in courses) {
          try {
            console.log(
              `${courses[course].subject} ${courses[course].catalogNbr}`,
            );
            const check = await Classes.find({
              classSub: courses[course].subject.toLowerCase(),
              classNum: courses[course].catalogNbr,
            }).exec();
            console.log(check);
            if (check.length === 0) {
              console.log(
                `new class: ${courses[course].subject} ${courses[course].catalogNbr},${semesters[semester]}`,
              );
              // insert new class with empty prereqs and reviews
              await new Classes({
                classSub: courses[course].subject.toLowerCase(),
                classNum: courses[course].catalogNbr,
                classTitle: courses[course].titleLong,
                classPrereq: [],
                classFull: `${courses[course].subject.toLowerCase()} ${
                  courses[course].catalogNbr
                } ${courses[course].titleLong.toLowerCase()}`,
                classSems: [semesters[semester]],
              }).save();
            } else {
              const matchedCourse = check[0]; // only 1 should exist
              const oldSems = matchedCourse.classSems;
              if (oldSems && oldSems.indexOf(semesters[semester]) === -1) {
                // console.log("update class " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
                oldSems.push(semesters[semester]); // add this semester to the list
                Classes.update(
                  { _id: matchedCourse._id },
                  { $set: { classSems: oldSems } },
                );
              }
            }
          } catch (error) {
            console.log("Error in addAllCourses: 3");
            return 0;
          }
        }
      }),
    );
  });
  console.log("Finished addAllCourses");
  return 1;
}

export async function updateProfessors(semesters: any) {
  // You just want to go through all the classes in the Classes database and update the Professors field
  // Don't want to go through the semesters
  // Might want a helper function that returns that professors for you
  console.log("In updateProfessors method");
  for (const semester in semesters) {
    // get all classes in this semester
    // console.log(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`);
    try {
      await axios.get(
        `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`,
        { timeout: 30000 },
      );
    } catch (error) {
      console.log("Error in updateProfessors: 1");
      console.log(error);
      continue;
    }
    const result = await axios.get(
      `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`,
      { timeout: 30000 },
    );
    // console.log(result)
    if (result.status !== 200) {
      console.log("Error in updateProfessors: 2");
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
          console.log("Error in updateProfessors: 3");
          console.log(error);
          continue;
        }
        const result2 = await axios.get(
          `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`,
          { timeout: 30000 },
        );
        if (result2.status !== 200) {
          console.log("Error in updateProfessors: 4");
          console.log(result2.status);
          continue;
        } else {
          const response2 = result2.data;
          const courses = response2.data.classes;

          // add each class to the Classes collection if it doesnt exist already
          for (const course in courses) {
            try {
              const check = await Classes.find({
                classSub: courses[course].subject.toLowerCase(),
                classNum: courses[course].catalogNbr,
              }).exec();
              const matchedCourse = check[0]; // catch this if there is no class existing
              if (typeof matchedCourse !== "undefined") {
                // console.log(courses[course].subject);
                // console.log(courses[course].catalogNbr);
                // console.log("This is the matchedCourse")
                // console.log(matchedCourse)
                let oldProfessors = matchedCourse.classProfessors;
                if (oldProfessors === undefined) {
                  oldProfessors = [];
                }
                // console.log("This is the length of old profs")
                // console.log(oldProfessors.length)
                const { classSections } = courses[course].enrollGroups[0]; // This returns an array
                for (const section in classSections) {
                  if (
                    classSections[section].ssrComponent === "LEC"
                    || classSections[section].ssrComponent === "SEM"
                  ) {
                    // Checks to see if class has scheduled meetings before checking them
                    if (classSections[section].meetings.length > 0) {
                      const professors = classSections[section].meetings[0].instructors;
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
                            // console.log("This is a new professor")
                            // console.log(typeof oldProfessors)
                            // console.log(oldProfessors)
                          }
                        }
                      } else {
                        // console.log("This class does not have professors");
                      }
                    } else {
                      // console.log("This class does not have meetings scheduled");
                    }
                  }
                }
                await Classes.update(
                  { _id: matchedCourse._id },
                  { $set: { classProfessors: oldProfessors } },
                ).exec();
              }
            } catch (error) {
              console.log("Error in updateProfessors: 5");
              console.log(
                `Error on course ${courses[course].subject} ${courses[course].catalogNbr}`,
              );
              console.log(error);

              return 1;
            }
          }
        }
      }
    }
  }
  console.log("Finished updateProfessors");
  return 0;
}

export async function resetProfessorArray(semesters: any) {
  // Initializes the classProfessors field in the Classes collection to an empty array so that
  // we have a uniform empty array to fill with updateProfessors
  // Will only have to be called ONCE
  console.log("In resetProfessorArray method");
  for (const semester in semesters) {
    // get all classes in this semester
    const result = await axios.get(
      `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`,
      { timeout: 30000 },
    );
    if (result.status !== 200) {
      console.log("Error in resetProfessorArray: 1");
      console.log(result.status);
      return 0;
    }

    const response = result.data;
    // console.log(response);
    const sub = response.data.subjects; // array of the subjects
    for (const course in sub) {
      // for every subject
      const parent = sub[course];
      console.log(
        `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`,
      );
      const result2 = await axios.get(
        `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`,
        { timeout: 30000 },
      );

      if (result2.status !== 200) {
        console.log("Error in resetProfessorArray: 2");
        return 0;
      }

      const response2 = result2.data;
      // console.log("PRINTING ALL THE COURSES")
      const courses = response2.data.classes;
      // console.log(courses)

      // add each class to the Classes collection if it doesnt exist already
      for (const course in courses) {
        try {
          const check = await Classes.find({
            classSub: courses[course].subject.toLowerCase(),
            classNum: courses[course].catalogNbr,
          }).exec();
          const matchedCourse = check[0]; // catch this if there is no class existing
          if (typeof matchedCourse !== "undefined") {
            console.log(courses[course].subject);
            console.log(courses[course].catalogNbr);
            console.log("This is the matchedCourse");
            console.log(matchedCourse);
            // var oldProfessors = matchedCourse.classProfessors
            const oldProfessors = [];
            console.log("This is the length of old profs");
            console.log(oldProfessors.length);
            Classes.update(
              { _id: matchedCourse._id },
              { $set: { classProfessors: oldProfessors } },
            );
          }
        } catch (error) {
          console.log("Error in resetProfessorArray: 5");
          console.log(
            `Error on course ${courses[course].subject} ${courses[course].catalogNbr}`,
          );
          console.log(error);
          return 0;
        }
      }
    }
  }
  console.log("professors reset");
  return 1;
}

export async function getProfessorsForClass() {
  // Need the method here to extract the Professor from the response
  // return the array here
}

/* # Grabs the API-required format of the current semester, to be given to the
   # addAllCourses function.
   # Return: String Array (length = 1)
*/
export async function findCurrSemester() {
  let response = await axios.get(
    "https://classes.cornell.edu/api/2.0/config/rosters.json",
    { timeout: 30000 },
  );
  if (response.status !== 200) {
    console.log("Error in findCurrSemester");
  } else {
    response = response.data;
    const allSemesters = response.data.rosters;
    const thisSem = allSemesters[allSemesters.length - 1].slug;
    console.log(`Updating for following semester: ${thisSem}`);
    return [thisSem];
  }
}

/* # Grabs the API-required format of the all recent semesters to be given to the
   # addAllCourses function.
   # Return: String Array
*/
export async function findAllSemesters(): Promise<string[]> {
  let response = await axios.get(
    "https://classes.cornell.edu/api/2.0/config/rosters.json",
    { timeout: 30000 },
  );
  if (response.status !== 200) {
    console.log("error");
    return [];
  }
  response = response.data;
  const allSemesters = response.data.rosters;
  return allSemesters.map((semesterObject) => semesterObject.slug);
}

/* # Look through all courses in the local database, and identify those
   # that are cross-listed (have multiple official names). Link these classes
   # by adding their course_id to all crosslisted class's crosslist array.
   #
   # Called once during intialization, only after all courses have been added.
*/
export async function addCrossList() {
  const semesters = await findAllSemesters();
  for (const semester in semesters) {
    // get all classes in this semester
    const result = await axios.get(
      `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`,
      { timeout: 30000 },
    );
    if (result.status !== 200) {
      console.log("Error in addCrossList: 1");
      return 0;
    }
    const response = result.data;
    // console.log(response);
    const sub = response.data.subjects;
    for (const course in sub) {
      const parent = sub[course];

      // for each subject, get all classes in that subject for this semester
      const result2 = await axios.get(
        `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`,
        { timeout: 30000 },
      );
      if (result2.status !== 200) {
        console.log("Error in addCrossList: 2");
        return 0;
      }
      const response2 = result2.data;
      const courses = response2.data.classes;

      for (const course in courses) {
        try {
          const check = await Classes.find({
            classSub: courses[course].subject.toLowerCase(),
            classNum: courses[course].catalogNbr,
          }).exec();
          // console.log((courses[course].subject).toLowerCase() + " "  + courses[course].catalogNbr);
          // console.log(check);
          if (check.length > 0) {
            const crossList = courses[course].enrollGroups[0].simpleCombinations;
            if (crossList.length > 0) {
              const crossListIDs: string[] = await Promise.all(
                crossList.map(async (crossListedCourse: any) => {
                  console.log(crossListedCourse);
                  const dbCourse = await Classes.find({
                    classSub: crossListedCourse.subject.toLowerCase(),
                    classNum: crossListedCourse.catalogNbr,
                  }).exec();
                  // Added the following check because MUSIC 2340
                  // was crosslisted with AMST 2340, which was not in our db
                  // so was causing an error here when calling 'dbCourse[0]._id'
                  // AMST 2340 exists in FA17 but not FA18
                  if (dbCourse[0]) {
                    return dbCourse[0]._id;
                  }

                  return null;
                }),
              );
              console.log(
                `${courses[course].subject} ${courses[course].catalogNbr}`,
              );
              // console.log(crossListIDs);
              const thisCourse = check[0];
              Classes.update(
                { _id: thisCourse._id },
                { $set: { crossList: crossListIDs } },
              );
            }
          }
        } catch (error) {
          console.log("Error in addCrossList: 3");
          console.log(error);
          return 0;
        }
      }
    }
  }
  console.log("Finished addCrossList");
  return 1;
}

import axios from 'axios';
import { ScrapingSubject, ScrapingClass } from './types';
import { Classes, Professors, Subjects } from '../db/schema';
import shortid from 'shortid';
import { extractProfessors } from './populate-professors';
import { fetchSubjects } from './populate-subjects';

/*
 * Fetch all the classes for that semester/subject combination
 * Returns a list of classes on success, or null if there was an error.
 */
export async function fetchClassesForSubject(
  endpoint: string,
  semester: string,
  subject: ScrapingSubject,
): Promise<ScrapingClass[] | null> {
  try {
    const result = await axios.get(
      `${endpoint}search/classes.json?roster=${semester}&subject=${subject.value}`,
      { timeout: 10000 },
    );

    if (result.status !== 200 || result.data.status !== 'success') {
      console.log(
        `Error fetching subject ${semester}-${subject.value} classes! HTTP: ${result.statusText} SERV: ${result.data.status}`,
      );
      return null;
    }

    const classes = result.data.data.classes;
    return classes;
  } catch (err) {
    return null;
  }
}

export async function addNewSemester(endpoint: string, semester: string) {
  const subjects = await fetchSubjects(endpoint, semester);
  if (!subjects) {
    return false;
  }

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
    console.log('Something went wrong while updating subjects!');
    return false;
  }

  if (!subjects) {
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
                    major: 'None' /* TODO: change? */,
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

            if (!res) {
              return false;
            }
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
            const classSems =
              classIfExists.classSems?.indexOf(semester) == -1
                ? classIfExists.classSems.concat([semester])
                : classIfExists.classSems;

            // Compute the new set of professors for this class
            const classProfessors = classIfExists.classProfessors
              ? classIfExists.classProfessors
              : [];

            // Add any new professors to the class
            profs.forEach((inst) => {
              if (classProfessors.filter((i) => i == inst).length === 0) {
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
    console.log('Something went wrong while updating classes');
    return false;
  }

  return true;
}

export async function fetchAddClassesForSubject(
  subject: ScrapingSubject,
  endpoint: string,
  semester: string,
) {
  const classes: ScrapingClass[] | null = await fetchClassesForSubject(
    endpoint,
    semester,
    subject,
  );

  // skip if something went wrong fetching classes
  // it could be that there are not classes here (in tests, corresponds to FEDN)
  if (classes === null) {
    return true;
  }

  await Promise.all(
    classes.map(async (course) => {
      const classExists = await Classes.findOne({
        classSub: course.subject.toUpperCase(),
        classNum: course.catalogNbr,
      }).exec();

      const professors = extractProfessors(course);

      // figure out if the professor already exist in the collection, if not, add to the collection
      // build a list of professor names to potentially add the the class
      const profs: string[] = await Promise.all(
        professors.map(async (p) => {
          // This has to be an atomic upset. Otherwise, this causes some race condition badness
          const courseProfessors = await Professors.findOneAndUpdate(
            { fullName: `${p.firstName} ${p.lastName}` },
            {
              $setOnInsert: {
                fullName: `${p.firstName} ${p.lastName}`,
                _id: shortid.generate(),
                major: 'None' /* TODO: change? */,
              },
            },
            { upsert: true, new: true },
          );

          return courseProfessors.fullName;
        }),
      ).catch((err) => {
        console.log(err);
        return [];
      });

      console.log(
        `Extracted professors from course ${course.subject.toUpperCase()}${
          course.catalogNbr
        }....`,
      );

      if (!classExists) {
        console.log(
          `Course ${course.subject.toUpperCase()}${
            course.catalogNbr
          } does not exist, adding to database...`,
        );

        const newClass = {
          _id: shortid.generate(),
          classSub: course.subject.toUpperCase(),
          classNum: course.catalogNbr,
          classTitle: course.catalogNbr,
          classFull: `${course.subject.toUpperCase()} ${course.subject.toUpperCase()}${
            course.catalogNbr
          } ${course.catalogNbr}`,
          classSems: [semester],
          classProfessors: profs,
          classRating: null,
          classWorkload: null,
          classDifficulty: null,
        };

        const saveNewClass = await new Classes(newClass).save().catch((err) => {
          console.log(err);
        });

        console.log(
          `Saved new course ${course.subject.toUpperCase()}${
            course.catalogNbr
          } to database...`,
        );

        profs.forEach(async (p) => {
          await Professors.findOneAndUpdate(
            { fullName: p },
            { $addToSet: { courses: newClass._id } },
          );
        });

        console.log(
          `Adding course ${course.subject.toUpperCase()}${
            course.catalogNbr
          } to professors' courses...`,
        );

        if (!saveNewClass) {
          console.log(
            `Saving new course ${course.subject.toUpperCase()}${
              course.catalogNbr
            } failed!`,
          );
        }
      } else {
        const classSems =
          classExists.classSems?.indexOf(semester) === -1
            ? classExists.classSems.concat([semester])
            : classExists.classSems;

        console.log(
          `Added semester ${semester} to course semesters for ${course.subject.toUpperCase()}${
            course.catalogNbr
          }...`,
        );

        const classProfessors = classExists.classProfessors
          ? classExists.classProfessors
          : [];

        profs.forEach((p) => {
          if (classProfessors.filter((i) => i == p).length === 0) {
            classProfessors.push(p);
          }
        });

        console.log(
          `Added professors to course ${course.subject.toUpperCase()}${
            course.catalogNbr
          }...`,
        );

        const updateClassInfo = await Classes.findOneAndUpdate(
          { _id: classExists._id },
          { $set: { classSems, classProfessors } },
        )
          .exec()
          .catch((err) => {
            console.log(err);
          });

        console.log(
          `Updated course information with recent semester and professors...`,
        );

        classProfessors.forEach(async (p) => {
          await Professors.findOneAndUpdate(
            { fullName: p },
            { $addToSet: { courses: classExists._id } },
          ).catch((err) => console.log(err));
        });

        console.log(
          `Added course ${course.subject.toUpperCase()}${
            course.catalogNbr
          } to professors' course list...`,
        );

        if (!updateClassInfo) {
          console.log(
            `Failed to update course ${course.subject.toUpperCase()}${
              course.catalogNbr
            }!`,
          );
        }

        console.log(
          `Successfully updated course ${course.subject.toUpperCase()}${
            course.catalogNbr
          }!`,
        );
      }
    }),
  ).catch((err) => {
    console.log(
      `An error occurred while added new courses for subject ${subject}: ${err}`,
    );
    return false;
  });

  return true;
}

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
      console.log('Error in addAllCourses: 1');
      return false;
    }
    const response = result.data;
    // console.log(response);
    const sub = response.data.subjects;
    await Promise.all(
      Object.keys(sub).map(async (course) => {
        try {
          const parent = sub[course];
          // if subject doesn't exist add to Subjects collection
          const checkSub = await Subjects.find({
            subShort: parent.value.toLowerCase(),
          }).exec();
          if (checkSub.length === 0) {
            console.log(`new subject: ${parent.value}`);
            await new Subjects({
              _id: shortid.generate(),
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
            console.log('Error in addAllCourses: 2');
            return false;
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
                  _id: shortid.generate(),
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
              console.log('Error in addAllCourses: 3');
              return false;
            }
          }
        } catch (err) {
          return false;
        }
      }),
    );
  });
  console.log('Finished addAllCourses');
  return true;
}

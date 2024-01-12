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
  console.log(semester);
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
  await Promise.all(
    subjects.map(async (subject) => {
      const classes = await fetchAddClassesForSubject(
        subject,
        endpoint,
        semester,
      );

      // skip if something went wrong fetching classes
      // it could be that there are not classes here (in tests, corresponds to FEDN)
      if (!classes) {
        return true;
      }
    }),
  ).catch((err) => {
    return false;
  });

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
        classSub: course.subject.toLowerCase(),
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

        const regex = new RegExp('^[0-9]+$');
        if (!regex.test(course.titleLong)) {
          const newClass = {
            _id: shortid.generate(),
            classSub: course.subject.toLowerCase(),
            classNum: course.catalogNbr,
            classTitle: course.titleLong,
            classFull: `${course.subject.toUpperCase()} ${course.catalogNbr}: ${
              course.titleLong
            }`,
            classSems: [semester],
            classProfessors: profs,
            classRating: null,
            classWorkload: null,
            classDifficulty: null,
          };

          const saveNewClass = await new Classes(newClass)
            .save()
            .catch((err) => {
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
        }
      } else {
        // Compute the new set of semesters for this class
        const classSems =
          classExists.classSems?.indexOf(semester) === -1
            ? classExists.classSems.concat([semester])
            : classExists.classSems;

        console.log(
          `Added semester ${semester} to course semesters for ${course.subject.toUpperCase()}${
            course.catalogNbr
          }...`,
        );

        // Compute the new set of professors for this class
        const classProfessors = classExists.classProfessors
          ? classExists.classProfessors
          : [];

        profs.forEach((p) => {
          if (classProfessors.filter((i) => i === p).length === 0) {
            classProfessors.push(p);
          }
        });

        console.log(
          `Added professors to course ${course.subject.toUpperCase()}${
            course.catalogNbr
          }...`,
        );

        const updateClassInfo = await Classes.updateOne(
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

export async function addAllCourses(endpoint: string, semesters: string[]) {
  await Promise.all(
    semesters.map(async (semester) => {
      const result = await addNewSemester(endpoint, semester);

      if (!result) {
        return false;
      }
    }),
  );
  console.log('Finished addAllCourses');
  return true;
}

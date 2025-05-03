/* eslint-disable operator-linebreak */
/* eslint-disable prefer-template */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import axios from 'axios';
import shortid from 'shortid';
import { ScrapingSubject, ScrapingClass } from './types';
import {
  Classes,
  Professors,
  Subjects,
  RecommendationMetadata
} from '../db/schema';
import { extractProfessors } from './populate-professors';
import { fetchSubjects } from './populate-subjects';
import { cosineSimilarity } from '../src/course/course.recalgo';
import { addStudentReview } from '../src/review/review.controller';
import { ClassificationType } from 'typescript';

/**
 * Adds all possible crosslisted classes retrieved from Course API to crosslisted list in Courses database for all semesters.
 *
 * @param {string[]} semesters: all available course roster semesters
 * @returns true if operation was successful, false otherwise
 */
export const addAllCrossList = async (
  semesters: string[]
): Promise<boolean> => {
  for (const semester in semesters) {
    const result = await addCrossList(semesters[semester]);

    if (!result) {
      return false;
    }
  }

  console.log('Finished addCrossList');
  return true;
};

/**
 * Retrieves all classes from Course API and identifies cross listed classes to add to crosslist array in Courses database.
 * Called after adding all new courses and professors for a new semester.
 *
 * @param {string} semester: course roster semester for (i.e FA23)
 * @returns true if operation was successful, false otherwise
 */
export const addCrossList = async (semester: string): Promise<boolean> => {
  try {
    const result = await axios.get(
      `https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semester}`,
      { timeout: 30000 }
    );

    if (result.status !== 200) {
      console.log('Error in addCrossList: 1');
      return false;
    }

    const response = result.data;
    const sub = response.data.subjects;
    for (const course in sub) {
      const parent = sub[course];

      // for each subject, get all classes in that subject for this semester
      const result2 = await axios.get(
        `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semester}&subject=${parent.value}`,
        { timeout: 30000 }
      );
      if (result2.status !== 200) {
        console.log('Error in addCrossList: 2');
        return false;
      }
      const response2 = result2.data;
      const courses = response2.data.classes;

      for (const course in courses) {
        try {
          const check = await Classes.findOne({
            classSub: courses[course].subject.toLowerCase(),
            classNum: courses[course].catalogNbr
          }).exec();
          console.log(
            courses[course].subject.toLowerCase() +
              // eslint-disable-next-line operator-linebreak
              ' ' +
              courses[course].catalogNbr
          );
          console.log(check);
          const crossList = courses[course].enrollGroups[0].simpleCombinations;
          if (crossList.length > 0) {
            const crossListIDs: string[] = await Promise.all(
              crossList
                .map(async (crossListedCourse: ScrapingClass) => {
                  console.log(crossListedCourse);
                  const dbCourse = await Classes.findOne({
                    classSub: crossListedCourse.subject.toLowerCase(),
                    classNum: crossListedCourse.catalogNbr
                  }).exec();

                  // Added the following check because MUSIC 2340
                  // was crosslisted with AMST 2340, which was not in our db
                  // so was causing an error here when calling 'dbCourse[0]._id'
                  // AMST 2340 exists in FA17 but not FA18
                  if (dbCourse && dbCourse[0]) {
                    return dbCourse[0]._id;
                  }
                  return null;
                })
                .filter((courseId) => courseId !== null)
            );

            console.log(
              `${courses[course].subject} ${courses[course].catalogNbr}`
            );

            console.log(crossListIDs);
            if (!crossListIDs.includes(null)) {
              await Classes.updateOne(
                { _id: check._id },
                { $set: { crossList: crossListIDs } }
              );
            }
          }
        } catch (error) {
          console.log('Error in addCrossList: 3');
          console.log(error);
          return false;
        }
      }
    }

    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Fetch all the classes in Course API format for a particular subject/semester combination
 *
 * @param {string} endpoint: base url for fetching courses in a particular subject from Course API
 * @param {string} semester: course roster semester for (i.e FA23)
 * @param {ScrapingSubject} subject: represents subject info from Course API
 * @returns a list of classes on success or null if there was an error
 */
export const fetchClassesForSubject = async (
  endpoint: string,
  semester: string,
  subject: ScrapingSubject
): Promise<ScrapingClass[] | null> => {
  try {
    const result = await axios.get(
      `${endpoint}search/classes.json?roster=${semester}&subject=${subject.value}`,
      { timeout: 10000 }
    );

    if (result.status !== 200 || result.data.status !== 'success') {
      console.log(
        `Error fetching subject ${semester}-${subject.value} classes! HTTP: ${result.statusText} SERV: ${result.data.status}`
      );
      return null;
    }

    const { classes } = result.data.data;
    return classes;
  } catch (err) {
    return null;
  }
};

/**
 * Adds all new subjects, courses, and updates professors for a particular semester
 *
 * @param {string} endpoint: base url for fetching courses in a particular subject from Course API
 * @param {string} semester: course roster semester for (i.e FA23)
 * @returns true if operation was successful, false otherwise
 */
export const addNewSemester = async (
  endpoint: string,
  semester: string
): Promise<boolean> => {
  const subjects = await fetchSubjects(endpoint, semester);
  if (!subjects) {
    return false;
  }

  const v1 = await Promise.all(
    subjects.map(async (subject) => {
      const subjectIfExists = await Subjects.findOne({
        subShort: subject.value.toLowerCase()
      }).exec();

      if (!subjectIfExists) {
        console.log(`Adding new subject: ${subject.value}`);
        const res = await new Subjects({
          _id: shortid.generate(),
          subShort: subject.value.toLowerCase(),
          subFull: subject.descrformal
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
    })
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
      const result = await fetchAddClassesForSubject(
        subject,
        endpoint,
        semester
      );

      // skip if something went wrong fetching classes
      // it could be that there are not classes here (in tests, corresponds to FEDN)
      if (!result) {
        return true;
      }

      return result;
    })
  ).catch((err) => false);

  return true;
};

/**
 * Adds all new classes for a given subject/semester combination and updates any existing classes with new professors from Course API.
 *
 * @param {ScrapingSubject} subject: represents subject info from Course API
 * @param {string} endpoint: base url for fetching courses in a particular subject from Course API
 * @param {string} semester: course roster semester for (i.e FA23)
 * @returns true if operation was successful, false otherwise
 */
export const fetchAddClassesForSubject = async (
  subject: ScrapingSubject,
  endpoint: string,
  semester: string
): Promise<boolean> => {
  const classes: ScrapingClass[] | null = await fetchClassesForSubject(
    endpoint,
    semester,
    subject
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
        classNum: course.catalogNbr
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
                major: 'None' /* TODO: change? */
              }
            },
            { upsert: true, new: true }
          );

          return courseProfessors.fullName;
        })
      ).catch((err) => {
        console.log(err);
        return [];
      });

      console.log(
        `Extracted professors from course ${course.subject.toUpperCase()}${
          course.catalogNbr
        }....`
      );

      if (!classExists) {
        console.log(
          `Course ${course.subject.toUpperCase()}${
            course.catalogNbr
          } does not exist, adding to database...`
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
            classRating: 0,
            classWorkload: 0,
            classDifficulty: 0
          };

          const saveNewClass = await new Classes(newClass)
            .save()
            .catch((err) => {
              console.log(err);
            });

          console.log(
            `Saved new course ${course.subject.toUpperCase()}${
              course.catalogNbr
            } to database...`
          );

          profs.forEach(async (p) => {
            await Professors.findOneAndUpdate(
              { fullName: p },
              { $addToSet: { courses: newClass._id } }
            );
          });

          console.log(
            `Adding course ${course.subject.toUpperCase()}${
              course.catalogNbr
            } to professors' courses...`
          );

          if (!saveNewClass) {
            console.log(
              `Saving new course ${course.subject.toUpperCase()}${
                course.catalogNbr
              } failed!`
            );
          }
        }
      } else {
        // Compute the new set of semesters for this class
        const classSems =
          classExists.classSems?.indexOf(semester) === -1
            ? classExists.classSems.concat([semester])
            : classExists.classSems;

        classSems.sort((a, b) => {
          const yearA = parseInt(a.substring(2), 10);
          const yearB = parseInt(b.substring(2), 10);

          if (yearA !== yearB) {
            return yearA - yearB;
          }

          const semA = a.substring(0, 2);
          const semB = b.substring(0, 2);

          if (semA === semB) {
            return 0;
          } else if (semA === 'SP') {
            return -1;
          } else {
            return 1;
          }
        });

        console.log(
          `Added semester ${semester} to course semesters for ${course.subject.toUpperCase()}${
            course.catalogNbr
          }...`
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
          }...`
        );

        const updateClassInfo = await Classes.updateOne(
          { _id: classExists._id },
          { $set: { classSems, classProfessors } }
        )
          .exec()
          .catch((err) => {
            console.log(err);
          });

        console.log(
          `Updated course information with recent semester and professors...`
        );

        classProfessors.forEach(async (p) => {
          await Professors.findOneAndUpdate(
            { fullName: p },
            { $addToSet: { courses: classExists._id } }
          ).catch((err) => console.log(err));
        });

        console.log(
          `Added course ${course.subject.toUpperCase()}${
            course.catalogNbr
          } to professors' course list...`
        );

        if (!updateClassInfo) {
          console.log(
            `Failed to update course ${course.subject.toUpperCase()}${
              course.catalogNbr
            }!`
          );
        }

        console.log(
          `Successfully updated course ${course.subject.toUpperCase()}${
            course.catalogNbr
          }!`
        );
      }
    })
  ).catch((err) => {
    console.log(
      `An error occurred while added new courses for subject ${subject}: ${err}`
    );
    return false;
  });

  return true;
};

/**
 * Adds all new classes and updates any existing classes with new professors for every semester available from Course API.
 *
 * @param {string} endpoint: base url for fetching courses in a particular subject from Course API
 * @param {string[]} semesters: course roster semester for (i.e FA23)
 * @returns true if operation was successful, false otherwise
 */
export const addAllCourses = async (
  endpoint: string,
  semesters: string[]
): Promise<boolean> => {
  await Promise.all(
    semesters.map(async (semester) => {
      const result = await addNewSemester(endpoint, semester);

      if (!result) {
        return false;
      }

      return result;
    })
  );
  console.log('Finished addAllCourses');
  return true;
};

/**
 * Helper function that removes invalid entries from the database based on the updated Course API
 * @param course the course that includes an invalid entry
 * @param semester the invalid semester, must exist in the classSems list of course
 *
 * @returns true if operation was successful, false otherwise
 */
const removeInvalidSem = async (course, semester): Promise<boolean> => {
  try {
    const semesters = course.classSems.filter((sem) => sem !== semester);
    const courseId = course._id;
    await Classes.updateOne(
      { _id: courseId },
      { $set: { classSems: semesters } }
    );
    return true;
  } catch (err) {
    console.log(`Error occurred in removing invalid entry in database: ${err}`);
  }
  return false;
};

/**
 * Helper function that removes a course from the database
 * @param course the course that is being removed
 *
 * @returns true if operation was successful, false otherwise
 */
const removeCourse = async (course): Promise<boolean> => {
  const subject = course.classSub.toUpperCase();
  const num = course.classNum;
  try {
    const courseId = course._id;
    const result = await Classes.deleteOne({ _id: courseId });
    if (result.deletedCount === 1) {
      console.log(
        `Course ${subject} ${num} successfully removed from database.`
      );
      return true;
    } else {
      console.log(`Course ${subject} ${num} was not found in the database.`);
    }
  } catch (err) {
    console.log(
      `Failed to remove course ${subject} ${num} from database due to ${err}.`
    );
  }
  return false;
};

/**
 * Adds all course descriptions for the most recent semester from Course API to each class in Course database.
 * Called after adding all new courses and professors for a new semester.
 *
 * @returns true if operation was successful, false otherwise
 */
export const addAllDescriptions = async (): Promise<boolean> => {
  try {
    const courses = await Classes.find().exec();
    if (courses)
      for (const course of courses) {
        await addCourseDescription(course);
      }
    return true;
  } catch (err) {
    console.log(`Error in adding descriptions: ${err}`);
  }
};

/**
 * Retrieves course description from Course API and adds course description field in Course database
 *
 * @param {string} semester: course roster semester for most recent offering of course
 * @param {string} courseId: course ID of class stored in Course database
 * @returns true if operation was successful, false otherwise
 */
export const addCourseDescription = async (course): Promise<boolean> => {
  const courseId = course._id;
  const semesters = course.classSems;
  let semester;
  const subject = course.classSub.toUpperCase();
  const courseNum = course.classNum;
  const courseFromDb = await Classes.findOne({ _id: courseId }).exec();
  const checkDescription = courseFromDb.classDescription;
  const checkTitle = courseFromDb.classTitle;

  if (
    checkDescription &&
    checkDescription !== null &&
    checkDescription.includes(checkTitle)
  ) {
    console.log(`Already added description to ${subject} ${courseNum}`);
    return true;
  }

  for (let i = semesters.length - 1; i >= 0; i--) {
    semester = semesters[i];
    try {
      const result = await axios.get(
        `https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semester}&subject=${subject}`
      );
      const courses = result.data.data.classes;
      for (const c of courses) {
        if (c.catalogNbr === courseNum) {
          const description =
            c.description && c.description !== null
              ? `${c.titleLong}. ${c.description}`
              : c.titleLong;
          await Classes.updateOne(
            { _id: courseId },
            { $set: { classDescription: description } }
          );
          return true;
        }
      }
      removeInvalidSem(course, semester);
    } catch (err) {
      console.log(
        `Semester ${semester} for course subject ${subject} not in Course API`
      );
      removeInvalidSem(course, semester);
    }
  }
  removeCourse(course);
  console.log(`Error in adding description to course ${subject} ${courseNum}`);
  return false;
};

/**
 * Adds all course similarity data to Course database. Called after populating
 * database with necessary metadata information.
 *
 * @returns true if operation was successful, false otherwise
 */
export const addAllSimilarityData = async (): Promise<boolean> => {
  try {
    console.log('adding similarity data');
    const courses = await Classes.find().exec();
    if (courses) {
      for (const course of courses) {
        await addSimilarityData(courses, course);
      }
    }
    return true;
  } catch (err) {
    console.log(`Error in adding similarity data: ${err}`);
  }
};

/**
 * Adds the top 5 similar courses to a given course using the cosine similarity algorithm for sorting.
 *
 * @param courses the list of all courses in the Course database
 * @param course specific course stored in Course database
 * @returns true if operation was successful, false otherwise
 */
const addSimilarityData = async (courses, course): Promise<boolean> => {
  const courseId = course._id;
  const subject = course.classSub;
  const num = course.classNum;
  try {
    const similarities = [];
    const tfidf = await RecommendationMetadata.findOne({
      _id: courseId
    }).exec();
    for (const c of courses) {
      let crossList = false;
      for (const crosslist of c.crossList) {
        if (similarities.some((sim) => sim._id === crosslist)) {
          crossList = true;
          break;
        }
      }
      if (
        c._id !== courseId &&
        !c.crossList.includes(courseId) &&
        c.classRating &&
        c.classRating !== null &&
        c.classRating !== 0 &&
        !crossList
      ) {
        const compTfidf = await RecommendationMetadata.findOne({
          _id: c._id
        }).exec();
        const cos = cosineSimilarity(tfidf.tfidfVector, compTfidf.tfidfVector);
        if (cos < 1) {
          const rating = c.classRating;
          const workload = threshold(course.classWorkload, c.classWorkload);
          const difficulty = threshold(
            course.classDifficulty,
            c.classDifficulty
          );
          similarities.push({
            _id: c._id,
            className: c.classTitle,
            classSub: c.classSub,
            classNum: c.classNum,
            tags: [
              `Overall: ${rating.toPrecision(2)}/5`,
              `${workload} workload`,
              `${difficulty} difficulty`
            ],
            similarityScore: cos
          });
        }
      }
    }
    const topSimilarities = similarities
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);

    console.log(`${subject} ${num}`);

    const res = await Classes.updateOne(
      { _id: courseId },
      { $set: { recommendations: topSimilarities } }
    );
    if (!res) {
      throw new Error();
    }
    return true;
  } catch (err) {
    console.log(
      `Error in adding similarity data for ${subject} ${num}: ${err}`
    );
  }
};

// threshold for tags
const threshold = (a, b) => {
  if (b - a >= 0.5) {
    return 'higher';
  }
  if (b - a <= -0.5) {
    return 'lower';
  }
  return 'similar';
};

import axios from 'axios';
import { ScrapingSubject, ScrapingClass } from './types';
import { Classes, Professors } from '../db/schema';
import shortid from 'shortid';
import { extractProfessors } from './populate-professors';

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

  return await Promise.all(
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

      if (!classExists) {
        const newClass = {
          _id: shortid.generate(),
          classSub: course.subject.toLowerCase(),
          classNum: course.catalogNbr,
          classTitle: course.titleLong,
          classFull: `${course.subject.toLowerCase()} ${course.catalogNbr} ${
            course.titleLong
          }`,
          classSems: [semester],
          classProfessors: profs,
          classRating: null,
          classWorkload: null,
          classDifficulty: null,
        };

        const saveNewClass = await new Classes(newClass).save().catch((err) => {
          console.log(err);
          return false;
        });

        profs.forEach(async (p) => {
          await Professors.findOneAndUpdate(
            { fullName: p },
            { $addToSet: { courses: newClass._id } },
          );
        });

        if (!saveNewClass) {
          return false;
        }
      } else {
        const classSems =
          classExists?.classSems?.indexOf(semester) === -1
            ? classExists.classSems.concat([semester])
            : classExists?.classSems;

        const classProfessors = classExists?.classProfessors
          ? classExists.classProfessors
          : [];

        profs.forEach((p) => {
          if (classProfessors.filter((i) => i == p).length === 0) {
            classProfessors.push(p);
          }
        });

        const updateClassInfo = await Classes.findOneAndUpdate(
          { _id: classExists._id },
          { $set: { classSems, classProfessors } },
        )
          .exec()
          .catch((err) => {
            console.log(err);
            return false;
          });

        classProfessors.forEach(async (p) => {
          await Professors.findOneAndUpdate(
            { fullName: p },
            { $addToSet: { courses: classExists._id } },
          ).catch((err) => console.log(err));
        });

        if (!updateClassInfo) {
          return false;
        }

        return true;
      }
    }),
  ).catch((err) => {
    console.log(err);
    return false;
  });
}

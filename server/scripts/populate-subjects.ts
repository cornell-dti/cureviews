/* eslint-disable consistent-return */
/* eslint-disable no-console */
import axios from 'axios';
import shortid from 'shortid';
import { ScrapingSubject } from './types';
import { Subjects } from '../db/schema';

/**
 * Fetches all subjects in class roster for a given semester
 *
 * @param {string} endpoint: base url for fetching courses in a particular subject from Course API
 * @param {string} semester: course roster semester for (i.e FA23)
 * @returns subject on success, null if there was an error
 */
export const fetchSubjects = async (
  endpoint: string,
  semester: string,
): Promise<ScrapingSubject[] | null> => {
  try {
    const result = await axios.get(
      `${endpoint}config/subjects.json?roster=${semester}`,
      { timeout: 10000 },
    );

    if (result.status !== 200 || result.data.status !== 'success') {
      console.log(
        `Error fetching ${semester} subjects! HTTP: ${result.statusText} SERV: ${result.data.status}`,
      );
      return null;
    }

    const { subjects } = result.data.subjects;
    return subjects;
  } catch (err) {
    return null;
  }
};

/**
 * Adds all subjects retrieved from class roster for a given semester to the Subjects collection
 * Updates existing Subject in collection with new semester
 *
 * @param {string} endpoint: base url for fetching courses in a particular subject from Course API
 * @param {string} semester: course roster semester for (i.e FA23)
 * @returns subject on success, null if there was an error
 */
export const fetchAddSubjects = async (
  endpoint: string,
  semester: string,
): Promise<boolean> => {
  const subjects = await fetchSubjects(endpoint, semester);

  if (subjects === null) {
    return false;
  }

  await Promise.all(
    subjects.map(async (subject) => {
      const subjectExists = await Subjects.findOne({
        subShort: subject.value.toLowerCase(),
      }).exec();

      if (!subjectExists) {
        const res = await new Subjects({
          _id: shortid.generate(),
          subShort: subject.value.toLowerCase(),
          subFull: subject.descrformal,
        })
          .save()
          .catch((err) => {
            console.log(err);
            return false;
          });

        if (!res) {
          return false;
        }
      } else {
        // Update with descrformal name
        await Subjects.updateOne(
          { subShort: subject.value.toLowerCase() },
          {
            $set: {
              subFull: subject.descrformal
            }
          }
        ).catch((err) => {
          console.log(`Error updating subject ${subject.value}: ${err}`);
          return false;
        });
      }
    }),
  );

  return true;
};

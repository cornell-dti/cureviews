/* eslint-disable consistent-return */
/* eslint-disable no-console */
import axios from "axios";
import shortid from "shortid";
import { ScrapingSubject } from "./types";
import { Subjects } from "../db/schema";

/*
 * Fetch the class roster for a semester.
 * Returns the class roster on success, or null if there was an error.
 */
export async function fetchSubjects(
  endpoint: string,
  semester: string,
): Promise<ScrapingSubject[] | null> {
  try {
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

    const { subjects } = result.data.data;
    return subjects;
  } catch (err) {
    return null;
  }
}

export async function fetchAddSubjects(
  endpoint: string,
  semester: string,
): Promise<boolean> {
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
      }
    }),
  );

  return true;
}

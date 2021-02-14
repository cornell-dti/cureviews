import { ValidationChain, body } from "express-validator";
import { InsertUserRequest, CourseIdQuery } from "./Review";
import { Classes, Students, Subjects, Reviews } from "../dbDefs";
import { getUserByNetId, getVerificationTicket } from "./Auth";
import { DefaultDict, Token } from "./AdminChart";

import shortid = require("shortid");

// eslint-disable-next-line import/prefer-default-export
export const getCourseById = async (courseId: CourseIdQuery) => {
  try {
    // check: make sure course id is valid and non-malicious
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(courseId.courseId)) {
      return await Classes.findOne({ _id: courseId.courseId }).exec();
    }
    return { error: "Malformed Query" };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getCourseById' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return { error: "Internal Server Error" };
  }
};

/**
 * Inserts a new user into the database, if the user was not already present
 *
 * Returns 1 if the user was added to the database, or was already present
 * Returns 0 if there was an error
 */
export const insertUser = async (request: InsertUserRequest) => {
  const { googleObject } = request;
  try {
    // Check user object has all required fields
    if (googleObject.email.replace("@cornell.edu", "") !== null) {
      const user = await getUserByNetId(googleObject.email.replace("@cornell.edu", ""));
      if (user === null) {
        const newUser = new Students({
          _id: shortid.generate(),
          // Check to see if Google returns first and last name
          // If not, insert empty string to database
          firstName: googleObject.given_name ? googleObject.given_name : "",
          lastName: googleObject.family_name ? googleObject.family_name : "",
          netId: googleObject.email.replace("@cornell.edu", ""),
          affiliation: null,
          token: null,
          privilege: "regular",
        });

        await newUser.save();
      }
      return 1;
    }

    console.log("Error: Some user values are null in insertUser");
    return 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'insertUser' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return 0;
  }
};

/**
 * Creates a ValidationChain[] where the json object denoted by [jsonFieldName]
 * has non-empty fields listed in [fields].
 */
export const JSONNonempty = (jsonFieldName: string, fields: string[]) => {
  const ret: ValidationChain[] = [];
  fields.forEach((fieldName) => {
    ret.push(body(`${jsonFieldName}.${fieldName}`).notEmpty());
  });
  return ret;
};

export const verifyToken = async (token: string) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(token)) {
      const ticket = await getVerificationTicket(token);
      if (ticket && ticket.email) {
        const user = await getUserByNetId(ticket.email.replace('@cornell.edu', ''));
        if (user) {
          return user.privilege === 'admin';
        }
      }
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'verufyToken' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return false;
  }
};

export const topSubjects = async () => {
  try {
    // using the add-on library meteorhacks:aggregate, define pipeline aggregate functions
    // to run complex queries
    const pipeline = [
      // consider only visible reviews
      { $match: { visible: 1 } },
      // group by class and get count of reviews
      { $group: { _id: '$class', reviewCount: { $sum: 1 } } },
      // sort by decending count
      // {$sort: {"reviewCount": -1}},
      // {$limit: 10}
    ];
    // reviewedSubjects is a dictionary-like object of subjects (key) and
    // number of reviews (value) associated with that subject
    const reviewedSubjects = new DefaultDict();
    // run the query and return the class name and number of reviews written to it
    const results = await Reviews.aggregate<{ reviewCount: number; _id: string }>(pipeline, () => { });

    await Promise.all(results.map(async (course) => {
      const classObject = (await Classes.find({ _id: course._id }).exec())[0];
      // classSubject is the string of the full subject of classObject
      const subjectArr = await Subjects.find({ subShort: classObject.classSub }).exec();
      if (subjectArr.length > 0) {
        const classSubject = subjectArr[0].subFull;
        // Adds the number of reviews to the ongoing count of reviews per subject
        const curVal = reviewedSubjects.get(classSubject) || 0;
        reviewedSubjects[classSubject] = curVal + course.reviewCount;
      }
    }));

    // Creates a map of subjects (key) and total number of reviews (value)
    const subjectsMap = new Map(Object.entries(reviewedSubjects).filter((x): x is [string, number] => typeof x[1] === "number"));
    let subjectsAndReviewCountArray = Array.from(subjectsMap);
    // Sorts array by number of reviews each topic has
    subjectsAndReviewCountArray = subjectsAndReviewCountArray.sort((a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0));

    // Returns the top 15 most reviewed classes
    return subjectsAndReviewCountArray.slice(0, 15);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'topSubjects' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
};

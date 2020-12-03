import { ValidationChain, body } from "express-validator";
import { InsertUserRequest, CourseIdQuery } from "./Review";
import { Classes, Students } from "../dbDefs";
import { getUserByNetId } from "./Auth";

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

export const JSONNonempty = (jsonFieldName: string, fields: string[]) => {
  const ret: ValidationChain[] = [];
  fields.forEach((fieldName) => {
    ret.push(body(`${jsonFieldName}.${fieldName}`).notEmpty());
  });
  return ret;
};

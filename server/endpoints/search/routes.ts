import { body } from "express-validator";

import { Context, Endpoint } from "../../endpoints";
import { Classes, Subjects, Professors } from "../../db/dbDefs";
import { Search } from "./types";
import { courseSort, regexClassesSearch } from "./functions";

/*
 * Query for classes using a query
 */
export const getClassesByQuery: Endpoint<Search> = {
  guard: [body("query").notEmpty()],
  callback: async (ctx: Context, search: Search) => {
    // Filter by not-whitespace, then match any not word.
    const query = search.query.replace(/(?=[^\s])\W/g, "");
    try {
      const classes = await Classes.find(
        { $text: { $search: search.query } },
        { score: { $meta: "textScore" } },
        { sort: { score: { $meta: "textScore" } } },
      ).exec();
      if (classes && classes.length > 0) {
        return classes.sort(courseSort(query));
      }
      return await regexClassesSearch(query);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getClassesByQuery' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

/*
 * Searches the database on Subjects using the text index and returns matching subjects
 */
export const getSubjectsByQuery: Endpoint<Search> = {
  guard: [body("query").notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      return await Subjects.find(
        { $text: { $search: search.query } },
        { score: { $meta: "textScore" } },
        { sort: { score: { $meta: "textScore" } } },
      ).exec();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getSubjectsByQuery' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

/*
 * Searches the database on Professors using the text index and returns matching professors
 */
export const getProfessorsByQuery: Endpoint<Search> = {
  guard: [body("query").notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      return await Professors.find(
        { $text: { $search: search.query } },
        { score: { $meta: "textScore" } },
        { sort: { score: { $meta: "textScore" } } },
      ).exec();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getProfessorsByQuery' endpoint");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

export const getCoursesByMajor: Endpoint<Search> = {
  guard: [body("query").notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      let courses = [];
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(search.query)) {
        courses = await Classes.find({ classSub: search.query }).exec();
      }
      return courses;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getCoursesByMajor' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

export const getCoursesByProfessor: Endpoint<Search> = {
  guard: [body("query").notEmpty().isAscii()],
  callback: async (ctx: Context, search: Search) => {
    try {
      let courses = [];
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(search.query)) {
        const professorRegex = search.query.replace("+", ".*.");
        courses = await Classes.find({
          classProfessors: { $regex: professorRegex, $options: "i" },
        }).exec();
      }
      return courses;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getCoursesByProfessor' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return { error: "Internal Server Error" };
    }
  },
};

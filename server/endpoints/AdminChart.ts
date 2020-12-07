import { body } from "express-validator";
import { verifyToken } from "./utils";
import { Endpoint } from "../endpoints";
import { Reviews, Classes, Subjects } from "../dbDefs";

// howManyEachClass -done
// howManyReviewsEachClass - done
// totalReviews - done
// getReviewsOverTimeTop15
interface Token {
  token: string;
}

export const topSubjects: Endpoint<unknown> = {
  guard: [],
  callback: async () => {
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
      console.log(results);

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
  },
};

export const howManyEachClass: Endpoint<Token> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (request: Token) => {
    const { token } = request;
    try {
      const userIsAdmin = await verifyToken(token);
      if (userIsAdmin) {
        const pipeline = [
          {
            $group: {
              _id: '$classSub',
              total: {
                $sum: 1,
              },
            },
          },
        ];
        return await Classes.aggregate(pipeline, () => { });
      }
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'howManyEachClass' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return null;
    }
  },
};

export const totalReviews: Endpoint<Token> = {
  // eslint-disable-next-line no-undef
  guard: [body("token").notEmpty().isAscii()],
  callback: async (request: Token) => {
    const { token } = request;
    try {
      const userIsAdmin = await verifyToken(token);
      if (userIsAdmin) {
        return Reviews.find({}).count();
      }
      return -1;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'totalReviews' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return -2;
    }
  },
};

export const howManyReviewsEachClass: Endpoint<Token> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (request: Token) => {
    const { token } = request;
    try {
      const userIsAdmin = await verifyToken(token);
      if (userIsAdmin) {
        const pipeline = [
          {
            $group: {
              _id: '$class',
              total: {
                $sum: 1,
              },
            },
          },
        ];
        const results = await Reviews.aggregate<{ _id: string; total: number }>(pipeline, () => { });
        results.map(async (data) => {
          const subNum = (await Classes.find({ _id: data._id }, { classSub: 1, classNum: 1 }).exec())[0];
          const id = `${subNum.classSub} ${subNum.classNum}`;
          return { _id: id, total: data.total };
        });
        return results;
      }
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'howManyReviewsEachClass' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return null;
    }
  },
};

// Recreation of Python's defaultdict to be used in topSubjects method
class DefaultDict<T = any> {
  [key: string]: T | Function;

  get(key: string): T | null {
    const val = this[key];

    if (this.hasOwnProperty(key) && typeof val !== "function") {
      return val;
    }
    return null;
  }
}

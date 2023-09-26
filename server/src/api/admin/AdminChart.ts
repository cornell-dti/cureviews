/* eslint-disable spaced-comment */
import { body } from "express-validator";
import { verifyToken } from "../../utils/utils";
import { Context, Endpoint } from "../../endpoints";
import { Reviews, Classes, Subjects } from "../../../db/dbDefs";
import { GetReviewsOverTimeTop15Request, Token } from "./types";
import { topSubjectsCB } from "./functions";

/**
 * Returns an key value object where key is a dept and value is an array of
 * key-value objects where key is a data and value is number of reviews for
 * that courses in that dept at the data given by the key:
 *
 * EX:
 * {
 *   math: [ {'2020-12-09' : 10}, {'2020-12-10' : 9}],
 *   cs: [ {}, ... ,{} ],
 * ...
 * }
 */
export const getReviewsOverTimeTop15: Endpoint<GetReviewsOverTimeTop15Request> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, request: GetReviewsOverTimeTop15Request) => {
    const { token, step, range } = request;
    try {
      const userIsAdmin = await verifyToken(token);
      if (userIsAdmin) {
        const top15 = await topSubjectsCB(ctx, { token });
        // contains cs, math, gov etc...
        const retArr = [];
        await Promise.all(
          top15.map(async (classs) => {
            const [subject] = await Subjects.find(
              {
                subFull: classs[0],
              },
              {
                subShort: 1,
              },
            ).exec(); // EX: computer science--> cs
            const subshort = subject.subShort;
            retArr.push(subshort);
          }),
        );
        const arrHM = []; // [ {"cs": {date1: totalNum}, math: {date1, totalNum} },
        // {"cs": {date2: totalNum}, math: {date2, totalNum} } ]
        for (let i = 0; i < range * 30; i += step) {
          // "data": -->this{"2017-01-01": 3, "2017-01-02": 4, ...}
          // run on reviews. gets all classes and num of reviewa for each class, in x day
          const pipeline = [
            {
              $match: {
                date: {
                  $lte: new Date(
                    new Date().setDate(new Date().getDate() - i),
                  ),
                },
              },
            },
            {
              $group: {
                _id: "$class",
                total: {
                  $sum: 1,
                },
              },
            },
          ];
          const hashMap = { total: null }; // Object {"cs": {date1: totalNum, date2: totalNum, ...}, math: {date1, totalNum} }
          // eslint-disable-next-line no-await-in-loop
          const results = await Reviews.aggregate<{
              _id: string;
              total: number;
            }>(pipeline);
            // eslint-disable-next-line no-await-in-loop
          await Promise.all(
            results.map(async (data) => {
              // { "_id" : "KyeJxLouwDvgY8iEu", "total" : 1 } //all in same date
              const res = await Classes.find(
                {
                  _id: data._id,
                },
                {
                  classSub: 1,
                },
              ).exec();

              const sub = res[0]; // finds the class corresponding to "KyeJxLouwDvgY8iEu" ex: cs 2112
              // date of this review minus the hrs mins sec
              const timeStringYMD = new Date(
                new Date().setDate(new Date().getDate() - i),
              )
                .toISOString()
                .split("T")[0];
              if (retArr.includes(sub.classSub)) {
                // if thos review is one of the top 15 we want.
                if (hashMap[sub.classSub] == null) {
                  // if not in hm then add
                  hashMap[sub.classSub] = {
                    [timeStringYMD]: data.total,
                  };
                } else {
                  // increment totalnum
                  hashMap[sub.classSub] = {
                    [timeStringYMD]:
                        hashMap[sub.classSub][timeStringYMD] + data.total,
                  };
                }
              }
              if (hashMap.total == null) {
                hashMap.total = {
                  [timeStringYMD]: data.total,
                };
              } else {
                hashMap.total = {
                  [timeStringYMD]: hashMap.total[timeStringYMD] + data.total,
                };
              }
            }),
          );
          arrHM.push(hashMap);
        }

        const hm2 = {}; // {cs: [{date1:totalNum}, {date2: totalNum}, ...], math: [{date1:total}, {date2: total}, ...], ... }

        // enrty:{"cs": {date1: totalNum}, math: {date1, totalNum} }
        if (arrHM.length > 0) {
          const entry = arrHM[0];
          const keys = Object.keys(entry);

          // "cs"
          keys.forEach((key) => {
            const t = arrHM.map((a) => a[key]); // for a key EX:"cs": [{date1:totalNum},{date2:totalNum}]
            hm2[key] = t;
          });
        }
        return hm2;
      }

      // user is not admin
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'getReviewsOverTimeTop15' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return null;
    }
  },
};

/**
 * Returns the top 15 subjects (in terms of number of reviews)
 */
export const topSubjects: Endpoint<Token> = {
  guard: [body("token").notEmpty()],
  callback: topSubjectsCB,
};

/**
 * Returns an array of key-val objects where keys are dept and vals are number
 * of courses in that dept.
 */
export const howManyEachClass: Endpoint<Token> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (_ctx: Context, request: Token) => {
    const { token } = request;
    try {
      const userIsAdmin = await verifyToken(token);
      if (userIsAdmin) {
        const pipeline = [
          {
            $group: {
              _id: "$classSub",
              total: {
                $sum: 1,
              },
            },
          },
        ];
        return await Classes.aggregate(pipeline);
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

/**
 * Gets total number of reviews in db
 */
export const totalReviews: Endpoint<Token> = {
  // eslint-disable-next-line no-undef
  guard: [body("token").notEmpty().isAscii()],
  callback: async (_ctx: Context, request: Token) => {
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

/**
 * Gets a array of key-value objects where each key a is class and value is
 * the number of reviews of that class.
 */
export const howManyReviewsEachClass: Endpoint<Token> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (_ctx: Context, request: Token) => {
    const { token } = request;
    try {
      const userIsAdmin = await verifyToken(token);
      if (userIsAdmin) {
        const pipeline = [
          {
            $group: {
              _id: "$class",
              total: {
                $sum: 1,
              },
            },
          },
        ];
        const results = await Reviews.aggregate<{ _id: string; total: number }>(
          pipeline,
        );

        const ret = await Promise.all(
          results.map(async (data) => {
            const subNum = (
              await Classes.find(
                { _id: data._id },
                { classSub: 1, classNum: 1 },
              ).exec()
            )[0];
            const id = `${subNum.classSub} ${subNum.classNum}`;
            return { _id: id, total: data.total };
          }),
        );

        return ret;
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
export class DefaultDict<T> {
  [key: string]: T | Function;

  get(key: string): T | null {
    const val = this[key];

    if (
      Object.prototype.hasOwnProperty.call(this, key)
      && typeof val !== "function"
    ) {
      return val;
    }
    return null;
  }
}

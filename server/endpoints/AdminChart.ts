import { body } from "express-validator";
import { verifyToken } from "./utils";
import { Endpoint } from "../endpoints";
import { Reviews, Classes } from "../dbDefs";

// howManyEachClass
// howManyReviewsEachClass - done
// totalReviews - done
// getReviewsOverTimeTop15
interface Token {
  token: string;
}

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

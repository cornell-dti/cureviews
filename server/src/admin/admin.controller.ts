import { verifyAdminToken } from "../auth/auth.controller";
import { Context } from "../endpoints";
import { Token } from "./admin.dto";
import { Reviews, Classes, Subjects } from "../../db/dbDefs";
import { DefaultDict } from "./AdminChart";

/**
 * Helper function for [topSubjects]
 */
// eslint-disable-next-line import/prefer-default-export
export const topSubjectsCB = async (_ctx: Context, request: Token) => {
  const userIsAdmin = await verifyAdminToken(request.token);
  if (!userIsAdmin) {
    return null;
  }

  try {
    // using the add-on library meteorhacks:aggregate, define pipeline aggregate functions
    // to run complex queries
    const pipeline = [
      // consider only visible reviews
      { $match: { visible: 1 } },
      // group by class and get count of reviews
      { $group: { _id: "$class", reviewCount: { $sum: 1 } } },
      // sort by decending count
      // {$sort: {"reviewCount": -1}},
      // {$limit: 10}
    ];
    // reviewedSubjects is a dictionary-like object of subjects (key) and
    // number of reviews (value) associated with that subject
    const reviewedSubjects = new DefaultDict<number>();
    // run the query and return the class name and number of reviews written to it
    const results = await Reviews.aggregate<{
      reviewCount: number;
      _id: string;
    }>(pipeline);

    await Promise.all(
      results.map(async (course) => {
        const classObject = (await Classes.find({ _id: course._id }).exec())[0];
        // classSubject is the string of the full subject of classObject
        const subjectArr = await Subjects.find({
          subShort: classObject.classSub,
        }).exec();
        if (subjectArr.length > 0) {
          const classSubject = subjectArr[0].subFull;
          // Adds the number of reviews to the ongoing count of reviews per subject
          const curVal = reviewedSubjects.get(classSubject) || 0;
          reviewedSubjects[classSubject] = curVal + course.reviewCount;
        }
      }),
    );

    // Creates a map of subjects (key) and total number of reviews (value)
    const subjectsMap = new Map(
      Object.entries(reviewedSubjects).filter(
        (x): x is [string, number] => typeof x[1] === "number",
      ),
    );
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

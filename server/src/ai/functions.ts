import { Reviews } from "../../db/schema"; // <- Want to access the database?

/** Docstring for minReviewsCosting. Takes in a minimum number of reviews that 
 * a course should have to have a summary generated. Finds only reviews from
 * those courses and returns the new total number of reviews, total number of 
 * words, and average number of words per review.
 * @params minimum number of reviews
 * @returns total number of reviews, total number of words, average number of 
 * words per review
 */
async function minReviewsCosting(minimum) {
  const courses = await Reviews.aggregate([
    {
      $addFields: {
        wordCount: { $size: { $split: ["$text", " "] } },
        charCount: { $strLenCP: "$text" }
      }
    },
    {
      $group: {
        _id: "$class",
        reviewCount: { $sum: 1 },
        totalWords: { $sum: "$wordCount" },
        totalChars: { $sum: "$charCount" }
      }
    },
    { $match: { reviewCount: { $gte: minimum } } },
    {
      $project: {
        _id: 0,
        classId: "$_id",
        reviewCount: 1,
        totalWords: 1,
        totalChars: 1
      }
    }
  ]);

  const totalReviewCount = courses.reduce((accumulator, course) => {
    return accumulator + course.reviewCount;
  }, 0);

  const totalWordCount = courses.reduce((accumulator, course) => {
    return accumulator + course.totalWords;
  }, 0);

  const totalCharCount = courses.reduce((accumulator, course) => {
    return accumulator + course.totalChars;
  }, 0);

  const gpt4cost = ((totalCharCount / 4) / 1000000 * 30) + ((totalCharCount / 4) / 1000000 * 60)
  const gpt3cost = ((totalCharCount / 4) / 1000000 * 0.5) + ((totalCharCount / 4) / 1000000 * 1.5)

  return {
    "min": minimum,
    "reviews": totalReviewCount,
    "words": totalWordCount,
    "avgwords": totalWordCount / totalReviewCount,
    "chars": totalCharCount,
    "avgchar": totalCharCount / totalReviewCount,
    "tokens": totalCharCount / 4,
    "avgtokens": (totalCharCount / 4) / totalReviewCount,
    "gpt4cost": Math.round(gpt4cost * 100) / 100,
    "gpt3cost": Math.round(gpt3cost * 100) / 100
  };
}

export { minReviewsCosting }
import { Reviews } from "../../db/schema"; // <- Want to access the database?

async function avgWordsPerReview(reviews) {
  const wordCounts = reviews.map(review => review.text.split(' ').length);
  const totalWords = wordCounts.reduce((acc, count) => acc + count, 0);
  return totalWords / reviews.length;
}

async function totalTokens(reviews) {
  const charCounts = reviews.map(review => review.text.replace(/\s/g, '').length);
  const tokens = charCounts.reduce((acc, count) => acc + count, 0);
  return tokens / 4;
}

/** Docstring for simpleCosting. Finds all reviews and counts the total number 
 * of reviews as well as the average length of each review.
 * @params none
 * @returns total number of reviews, average number of words per review
 */
async function simpleCosting() {
  const reviews = await Reviews.find();
  const avg_words = await avgWordsPerReview(reviews)
  const tokens = await totalTokens(reviews)
  return {
    "reviews": reviews.length,
    "words": avg_words,
    "tokens": tokens
  }
}

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

  return {
    "min": minimum,
    "reviews": totalReviewCount,
    "words": totalWordCount,
    "avgwords": totalWordCount / totalReviewCount,
    "chars": totalCharCount,
    "avgchar": totalCharCount / totalReviewCount,
    "tokens": totalCharCount / 4,
    "avgtokens": (totalCharCount / 4) / totalReviewCount
  };
}

async function avgReviewsPerCourse() {
  const courses = await Reviews.aggregate([
    { $addFields: { wordCount: { $size: { $split: ["$text", " "] } } } },
    { $group: { _id: "$class", reviewCount: { $sum: 1 }, totalWords: { $sum: "$wordCount" } } },
    { $project: { _id: 0, classId: "$_id", reviewCount: 1, totalWords: 1 } }
  ]);

  const totalReviews = courses.reduce((acc, course) => acc + course.reviewCount, 0);
  const averageReviewsPerCourse = totalReviews / courses.length;
  return averageReviewsPerCourse;
}



export { simpleCosting, minReviewsCosting, avgReviewsPerCourse }




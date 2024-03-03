import { Reviews } from "../../db/schema"; // <- Want to access the database?

/** Docstring for avgWordsPerReview. Takes in a set of reviews and returns the
 *  the average number of words per review
 * @param reviews - a set of Reviews
 * @returns the average length of a review in the set
 */
async function avgWordsPerReview(reviews) {
  const wordCounts = reviews.map(review => review.text.split(' ').length);
  const totalWords = wordCounts.reduce((acc, count) => acc + count, 0);
  return totalWords / reviews.length;
}

/** Docstring for simpleCosting. Finds all reviews and counts the total number 
 * of reviews as well as the average length of each review.
 * @params none
 * @returns total number of reviews, average number of words per review
 */
async function simpleCosting() {
  const reviews = await Reviews.find();
  const avg_words = await avgWordsPerReview(reviews)
  return {
    "reviews": reviews.length,
    "words": avg_words
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
    { $addFields: { wordCount: { $size: { $split: ["$text", " "] } } } },
    { $group: { _id: "$class", reviewCount: { $sum: 1 }, totalWords: { $sum: "$wordCount" } } },
    { $match: { reviewCount: { $gte: minimum } } },
    { $project: { _id: 0, classId: "$_id", reviewCount: 1, totalWords: 1 } }
  ]);

  const totalReviewCount = courses.reduce((accumulator, course) => {
    return accumulator + course.reviewCount;
  }, 0);

  const totalWordCount = courses.reduce((accumulator, course) => {
    return accumulator + course.totalWords;
  }, 0);

  return {
    "min": minimum,
    "reviews": totalReviewCount,
    "words": totalWordCount,
    "avgwords": totalWordCount / totalReviewCount
  };
}


export { simpleCosting, minReviewsCosting }




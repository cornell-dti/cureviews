import dotenv from 'dotenv';
import OpenAI from "openai";
import { Reviews } from "../../db/schema";

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Docstring for makeSummary. Takes in all reviews from a course as text and 
 * creates a 50 word summary of those reviews.
 * @params all reviews from a course
 * @returns summary of reviews
 */
async function makeSummary(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are creating a 50 word summary based on the collection of course reviews provided." },
      { role: "user", content: text }
    ],
  });
  return completion.choices[0].message.content;
}

/** Docstring for getCoursesWithMinReviews. We only want to create summaries for
 * courses that have at least a certain number of reviews, so takes in that number
 * and returns the courses that have at least that number of reviews.
 * @params min reviews summary should be created for
 * @returns courses ids with at least min reviews
 */
async function getCoursesWithMinReviews(minimum) {
  const courses = await Reviews.aggregate([
    {
      $group: {
        _id: "$class",
        reviewCount: { $sum: 1 }
      }
    },
    { $match: { reviewCount: { $gte: minimum } } },
    {
      $project: {
        _id: 0,
        classId: "$_id"
      }
    }
  ]);

  const courseIds = courses.map(course => course.classId);
  return courseIds;
}

export { makeSummary, getCoursesWithMinReviews }
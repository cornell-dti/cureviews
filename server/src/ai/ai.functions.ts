import dotenv from 'dotenv';
import OpenAI from "openai";
import { Reviews } from "../../db/schema";
import { findCourseById } from '../course/course.data-access';
import { CourseIdRequestType } from '../course/course.type';
import { findReviewCrossListOR } from '../utils';

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

/**
 * DocString for getReviewsForSummary. Gets all reviews from a course that will be used 
 * to generate the summary for a course
 * @param params takes in the courseID of a course that we need to generate a summary for
 * @returns all reviews for that course concatenated into a single string
 */
async function getReviewsForSummary(params: CourseIdRequestType) {
  const { courseId } = params;

  // Validate the course ID format
  const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
  if (!regex.test(courseId)) {
    return null; // Return null for invalid course ID
  }

  // Fetch the course by ID
  const course = await findCourseById(courseId);
  if (!course) return null; // Return null if no course is found

  // Fetch reviews for the course, including cross-listed courses
  const crossListOR = getCrossListOR(course);
  if (!crossListOR) return null; // Return null if no cross-listing data is available

  const reviews = await findReviewCrossListOR(crossListOR);
  if (reviews.length === 0) return null; // Return null if no reviews are found

  // Create a single string of all review texts separated by '/'
  const reviewTexts = reviews.map(review => review.text || "No review text").join(' / ');

  return reviewTexts;
}


/**
 * Helper function to get crosslist OR search criteria from a course.
 * @param course The course object to extract crosslist data.
 * @returns The formatted search criteria for crosslist.
 */
const getCrossListOR = (course) => {
  if (!course || !course.crossList || course.crossList.length === 0) {
    return null;
  }
  return [...course.crossList.map(cID => ({ class: cID })), { class: course._id }];
};

export { makeSummary, getCoursesWithMinReviews, getReviewsForSummary } 
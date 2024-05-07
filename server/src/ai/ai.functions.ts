import dotenv from 'dotenv';
import OpenAI from "openai";
import { Reviews } from "../../db/schema";
import { CourseIdRequestType } from '../course/course.type';
import { findReviewCrossListOR } from '../utils';
import { Classes } from "../../db/schema";
import { findCourseById } from '../course/course.data-access';


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
const getReviewsForSummary = async ({ courseId }: CourseIdRequestType) => {
  const course = await getCourseById({ courseId });

  if (course) {
    const crossListOR = getCrossListOR(course);

    if (!crossListOR) {
      return null;
    }

    const reviews = await findReviewCrossListOR(crossListOR);
    if (reviews.length === 0) {
      return "No reviews available";
    }

    // Sanitize reviews and join them into a single string separated by '/'
    const reviewTexts = reviews.map(review => {
      return review.text ? review.text.replace(/\/+/g, ' ') : "No review text";
    }).join(' / ');

    return reviewTexts;
  } else {
    return "Course not found";
  }
};


const getCourseById = async ({ courseId }: CourseIdRequestType) => {
  // check: make sure course id is valid and non-malicious
  const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
  if (regex.test(courseId)) {
    return await findCourseById(courseId);
  }

  return null;
};

/**
 * Helper function that returns array of course ids that a given course is crosslisted with
 *
 * @param {string} reviewId: Mongo-generated id of review
 * @returns true if operation was successful, false otherwise
 */
export const getCrossListOR = (course) => {
  if (!course) {
    return null;
  }

  const { crossList } = course;
  const courseId = course._id;

  if (crossList !== undefined && crossList.length > 0) {
    const crossListOR = crossList.map((cID) => ({
      class: cID,
    }));

    crossListOR.push({ class: courseId });

    return crossListOR;
  }

  return [
    {
      class: courseId,
    },
  ];
};

export { makeSummary, getCoursesWithMinReviews, getReviewsForSummary } 
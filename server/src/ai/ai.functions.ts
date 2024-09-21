import dotenv from 'dotenv';
import OpenAI from "openai";
import { Reviews } from "../../db/schema";
import { Classes } from "../../db/schema";

import { CourseIdRequestType } from '../course/course.type';
import { findReviewCrossListOR } from '../utils';


/* <=== Helper Functions ===> */

/** findCourseById 
 * 
 * @param courseId 
 * @returns a Class object that matches the courseId  
 */
export const findCourseById = async (courseId: string) => await Classes.findOne({ _id: courseId }).exec();


dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** makeSummary. 
 * 
 * Takes in all reviews from a course as text and 
 * creates a 50 word summary of those reviews.
 * @params a string that combines all reviews from a course
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

/** generateTags. 
 * 
 * Takes in all reviews from a course as text and 
 * generates 5 tags for those reviews describing lectures, assignments, professor,
 * skill, and resources as well as the corresponding connotation of that tag.
 * @params a string that combines all reviews from a course
 * @returns an array of adjectives and their corresponding connotations describing
 * lectures, assignments, professr, skills, and resources in that order
 */
async function generateTags(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system", content: `
          You are creating 5 adjectives describing the lectures, assignments, professor, skills, and resources,
          along with their connotations (positive, negative, neutral).
          
          Please provide the adjectives and connotations in the following format:
          'Lectures: [adjective] (positive/negative/neutral),
          Assignments: [adjective] (positive/negative/neutral),
          Professor: [adjective] (positive/negative/neutral),
          Skills: [adjective] (positive/negative/neutral),
          Resources: [adjective] (positive/negative/neutral)'.
        `
      },
      { role: "user", content: text }
    ],
  });
  const response = completion.choices[0].message.content;
  const tagsArray = response.split(',').map(item => {
    const match = item.match(/: (.+) \((.+)\)/);
    if (match) {
      const adjective = match[1].trim();
      const connotation = match[2].trim();
      return [adjective, connotation];
    } else {
      console.error("Unexpected format: ", item);
      return ["", ""];
    }
  });
  return tagsArray;
}

/** getCoursesWithMinReviews.
 * 
 *  Create summaries for courses that have at least a certain number of reviews. 
 * Takes in `min` number of reviews and returns the a list of course IDs that have at least that number of reviews.
 * @params min count of reviews that a course
 * @returns coursesIDs[] with at least min reviews
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
 * getReviewsPerCourse. 
 * 
 * Gets all reviews from a course that will be used 
 * to generate the summary for a course
 * @param courseId takes in the courseID of a course that we need to generate a summary for
 * @returns a single string of all reviews for that course concatenated 
 */
const getReviewsPerCourse = async ({ courseId }: CourseIdRequestType) => {
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

export { makeSummary, getCoursesWithMinReviews, getReviewsPerCourse as getReviewsForSummary, generateTags } 
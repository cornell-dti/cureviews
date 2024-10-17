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

/** summarize. 
 * 
 * Takes in all reviews from a course as text and 
 * generates 5 tags for those reviews describing lectures, assignments, professor,
 * skill, and resources as well as the corresponding connotation of that tag.
 * @params a string that combines all reviews from a course
 * @returns a dictionary containing 
 * Summary: 50 word summary of all reviews,
 * Tags: array of nouns, adjectives, and their corresponding connotations describing
 * in that order, ex: ["Lectures", "Entertaining", "Positive"]
 */
async function summarize(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system", content: `
          You are given a collection of course reviews provided where each review is separated by a /. You
          will then complete two tasks. First you should generate a 50 word summary of all reviews. Then 
          should create 5 adjectives describing the lectures, assignments, professor, skills, and resources,
          along with their connotations (positive, negative, neutral). Please only pick one adjective for each.
          
          Please provide the summary and tags in the following format:
          Summary: [50-word summary]
          Tags:
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
  const summaryMatch = response.match(/Summary: ([\s\S]*?)(?=Tags)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const tagsMatch = response.match(/Tags:\s*([\s\S]*)/);
  const tags = tagsMatch ? tagsMatch[1] : "";
  const tagsObject: { [key: string]: [string, string] } = {};

  tags.split(',').forEach(item => {
    const match = item.match(/(\w+): (.+) \((.+)\)/);
    if (match) {
      const category = match[1].trim();
      const adjective = match[2].trim();
      const connotation = match[3].trim();
      tagsObject[category] = [adjective, connotation];
    } else {
      console.error("Unexpected format: ", item);
    }
  });

  return {
    summary: summary,
    tags: tagsObject
  };
}

/**
 * updateCoursesWithAI.
 * 
 * Takes in a courseId and uses that ID to get all reviews from a course to then
 * generate a summary and 5 tags for those reviews. Then updates the classSummary
 * and classTags fields in the database for the corresponding course with the 
 * newly generated summary and tags. Also resets the freshness count for the course
 * back to 0. Returns a boolean indicating the success of this update.
 * @params a courseId in the form of a string
 * @returns true if update was successful and false if something went wrong
 * 
 */
const updateCoursesWithAI = async (courseId: string) => {
  try {
    const courseReviews = await Reviews.find({ class: courseId }).exec();

    const reviewsText = courseReviews.map(review => review.text || "").join(' / ');

    const { summary, tags } = await summarize(reviewsText);

    await Classes.updateOne(
      { _id: courseId },
      { $set: { classSummary: summary, classTags: tags, freshness: 0 } }
    );

    console.log(`Course ${courseId} updated successfully with summary and tags.`);
    return true;
  } catch (error) {
    console.error(`Error updating course with summary and tags: ${error.message}`);
    return false;
  }
};

/** getCoursesWithMinReviews.
 * 
 * Create summaries for courses that have at least a certain number of reviews. 
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
 * Gets all reviews from a course that will be used to generate the summary for
 * a course
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

export { getCoursesWithMinReviews, getReviewsPerCourse as getReviewsForSummary, summarize, updateCoursesWithAI } 

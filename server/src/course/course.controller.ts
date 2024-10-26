import { findCourseById, findCourseByInfo } from './course.data-access';
import { CourseIdRequestType, CourseInfoRequestType, CourseDescriptionRequestType } from './course.type';
import { preprocess, tfidf, cosineSimilarity, idf } from './course.recalgo';

import { findReviewCrossListOR } from '../utils';

/**
 * Returns array of course ids that a given course is crosslisted with
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

  // if there are crossListed Courses, merge the reviews
  if (crossList !== undefined && crossList.length > 0) {
    // format each courseid into an object to input to the find's '$or' search
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

export const getCourseById = async ({ courseId }: CourseIdRequestType) => {
  // check: make sure course id is valid and non-malicious
  const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
  if (regex.test(courseId)) {
    return await findCourseById(courseId);
  }

  return null;
};

export const getCourseByInfo = async ({
  number,
  subject,
}: CourseInfoRequestType) => {
  const course = await findCourseByInfo(number, subject.toLowerCase());
  return course;
};

export const getReviewsCrossListOR = async ({
  courseId,
}: CourseIdRequestType) => {
  const course = await getCourseById({ courseId });

  if (course) {
    const crossListOR = getCrossListOR(course);

    if (!crossListOR) {
      return null;
    }

    const reviews = await findReviewCrossListOR(crossListOR);
    const sanitizedReviews = reviews.map((review) => {
      const copy = review;
      copy.user = '';
      return copy;
    });

    return sanitizedReviews;
  }

  return null;
};

export const getProcessedDescription = (text) => {
  const processed = preprocess(text);
  return processed;
}

export const getSimilarity = () => {
  const descriptions = ["This course provides a detailed study on multiple financial markets including bonds, forwards, futures, swaps, and options and their role in addressing major issues facing humanity. In particular, we plan to study specific topics on the role of financial markets in addressing important issues like funding cancer cure, tackling climate change, and financing educational needs for the underserved. Relative to a traditional finance class, we take a broad approach and think of finance as a way to get things done and financial instruments as a way to solve problems. We explore topics related to diversification and purpose investing, including a highly innovative idea of a mega-fund developing cancer treatment. We examine how financial instruments can help solve or hedge some societal issues, particularly on climate change. As an example, we will be studying a financial solution to deal with California forest fire. We also examine the potential for social impact bonds for educating pre-school children and reducing prisoners' recidivism.",
    "This course introduces and develops the leading modern theories of economies open to trade in financial assets and real goods. The goal is to understand how cross-country linkages in influence macroeconomic developments within individual countries; how financial markets distribute risk and wealth around the world; and how trade changes the effectiveness of national monetary and fiscal policies. In exploring these questions, we emphasize the role that exchange rates and exchange rate policy take in shaping the consequences of international linkages. We apply our theories to current and recent events, including growing geoeconomic conflict between Eastern and Western countries, hyperinflation in Argentina, Brexit, and recent Euro-area debt crises.",
    "The Corporate Finance Immersion (CFI) Practicum is designed to provide students with a real world and practical perspective on the activities, processes and critical questions faced by corporate finance executives. It is oriented around the key principles of shareholder value creation and the skills and processes corporations use to drive value. The CFI Practicum will help develop skills and executive judgement for students seeking roles in corporate finance, corporate strategy, business development, financial planning, treasury, and financial management training programs. The course can also help students pursuing consulting to sharpen their financial skills and get an excellent view of a corporation's strategic and financial objectives. The practicum will be comprised of a mix of lectures, cases, guest speakers, and team projects. Additionally, there will be training workshops to build your financial modelling skills.",
    "Environmental Finance & Impact Investing Practicum",
    "Corporate Finance II"
  ]

  const processedDescriptions = descriptions.map(desc => preprocess(desc).split(' '));
  const allTerms = [...new Set(processedDescriptions.flat())];
  const idfValues = idf(allTerms, processedDescriptions);
  const tfidfVectors = processedDescriptions.map(terms => tfidf(terms, idfValues));

  let similarity = [];

  for (let i = 0; i < descriptions.length; i++) {
    for (let j = i + 1; j < descriptions.length; j++) {
      const cos = cosineSimilarity(tfidfVectors[i], tfidfVectors[j]);
      similarity.push({ courseA: i, courseB: j, similarity: cos });
    }
  }
  similarity.sort((a, b) => b.similarity - a.similarity);
  return similarity.slice(0, 5);
}
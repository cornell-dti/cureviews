import { findCourseById, findCourseByInfo } from './course.data-access';
import { CourseIdRequestType, CourseInfoRequestType, CourseDescriptionRequestType } from './course.type';
import { preprocess, tfidf, cosineSimilarity, idf } from './course.recalgo';

import { findReviewCrossListOR } from '../utils';
import axios from 'axios';

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

export const getSimilarity = async () => {
  const result = await axios.get(
    `https://classes.cornell.edu/api/2.0/search/classes.json?roster=FA24&subject=CS`
  );

  const csClasses = result.data.data.classes;
  let descriptions = [];
  for (const c of csClasses) {
    descriptions.push(c.description)
  }
  // const descriptions = ["Intermediate programming in a high-level language and introduction to software engineering. Topics include object-oriented programming (objects, classes, subtypes, encapsulation, polymorphism), program correctness (specifications, invariants, testing), algorithm analysis (asymptotic complexity, big \"O\" notation), recursion, data structures (lists, trees, stacks, queues, heaps, hash tables, graphs), iteration and searching/sorting, graph algorithms, and concurrent and event-driven programming (graphical user interfaces, synchronization). Java is the principal programming language.",
  //   "Intermediate software design and introduction to key computer science ideas. Topics are similar to those in CS 2110 but are covered in greater depth, with more challenging assignments. Topics include object-oriented programming, program structure and organization, program reasoning using specifications and invariants, recursion, design patterns, concurrent programming, graphical user interfaces, data structures as in CS 2110, sorting and graph algorithms, asymptotic complexity, and simple algorithm analysis. Java is the principal programming language.",
  //   "Programming and problem solving using Python. Emphasizes principles of software development, style, and testing. Topics include procedures and functions, iteration, recursion, arrays and vectors, strings, an operational model of procedure and function calls, algorithms, exceptions, object-oriented programming. Weekly labs provide guided practice on the computer, with staff present to help. ",
  //   "Programming and problem solving using Python. Emphasizes the systematic development of algorithms and programs. Topics include iteration, functions, arrays, strings, recursion, object-oriented programming, algorithms, and data handling and visualization. Assignments are designed to build an appreciation for complexity, dimension, randomness, simulation, and the role of approximation in engineering and science. Weekly discussion section provides guided practice on the computer, with staff present to help."
  // ]

  const processedDescriptions = descriptions.map(desc => preprocess(desc).split(' '));
  const allTerms = [...new Set(processedDescriptions.flat())];
  const idfValues = idf(allTerms, processedDescriptions);
  const tfidfVectors = processedDescriptions.map(terms => tfidf(terms, idfValues));

  const topSimilarities = {};

  for (let i = 0; i < descriptions.length; i++) {
    const similarities = [];
    for (let j = 0; j < descriptions.length; j++) {
      if (i !== j) {
        const cos = cosineSimilarity(tfidfVectors[i], tfidfVectors[j]);
        if (cos < 1) {
          similarities.push({
            courseA: csClasses[i].catalogNbr,
            courseB: csClasses[j].catalogNbr,
            similarity: cos
          });
        }
      }
    }
    topSimilarities[csClasses[i].catalogNbr] = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }
  return topSimilarities;
}
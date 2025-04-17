/* eslint-disable implicit-arrow-linebreak */
import { Classes, ReviewDocument, Reviews, Students } from '../../db/schema';
import { UpdateCourseMetrics } from './admin.type';
import { findCourseById } from '../course/course.data-access';

/**
 * Updates metrics for a course based on a recently written review
 * @param review the review that was submitted by a user and approved by an admin
 * @param state the updated metrics for the specified course
 */
export const updateCourseMetrics = async (
  review: ReviewDocument,
  state: UpdateCourseMetrics
) => {
  await Classes.updateOne(
    { _id: review.class },
    {
      $set: {
        classDifficulty:
          state.diff !== null && !isNaN(state.diff) ? state.diff : null,
        classRating:
          state.rating !== null && !isNaN(state.rating) ? state.rating : null,
        classWorkload:
          state.workload !== null && !isNaN(state.workload)
            ? state.workload
            : null
      }
    }
  );
};

/*
 * Returns all pending reviews in the database
 */
export const findPendingReviews = async () =>
  await Reviews.find(
    { visible: 0, reported: 0 },
    {},
    { sort: { date: -1 }, limit: 700 }
  ).exec();

/*
 * Returns all reported reviews in the database
 */
export const findReportedReviews = async () =>
  await Reviews.find(
    { visible: 0, reported: 1 },
    {},
    { sort: { date: -1 }, limit: 700 }
  ).exec();

/*
 * Returns all approved reviews in the database
 */
export const findApprovedReviews = async (limit: number = 250) =>
  await Reviews.find(
    { visible: 1, reported: 0 },
    {},
    { sort: { date: -1 }, limit }
  ).exec();

/*
 * Count reviews by approved, pending, and reported and return the total counts
 */
export const findReviewCounts = async () => {
  const approvedCount = await Reviews.countDocuments({ visible: 1 }).exec();
  const pendingCount = await Reviews.countDocuments({
    visible: 0,
    reported: 0
  }).exec();
  const reportedCount = await Reviews.countDocuments({
    visible: 0,
    reported: 1
  }).exec();
  const result = {
    approved: approvedCount,
    pending: pendingCount,
    reported: reportedCount
  };
  return result;
};

/*
 * Counts the number of approved reviews per class in the database.
 * Count per class is mapped to a CSV string format.
 */
export const createCourseCSV = async () => {
  const approvedReviews = await Reviews.find({ visible: 1 }).exec();
  let csv = 'Class,Number of Reviews\n';

  const revsPerCourse: Map<string, number> = new Map();
  await Promise.all(
    approvedReviews.map(async (review) => {
      const course = await findCourseById(review.class);
      const title =
        (await course.classSub.toUpperCase()) + ' ' + course.classNum;

      if (revsPerCourse.has(title)) {
        await revsPerCourse.set(title, revsPerCourse.get(title) + 1);
      } else {
        await revsPerCourse.set(title, 1);
      }
    })
  );

  revsPerCourse.forEach((count, courseTitle) => {
    csv += courseTitle + ',' + count + '\n';
  });

  return csv;
};

/**
 * Removes pending review from website and database
 * @param {string} reviewId: Mongo generated review id.
 */
export const removeReviewById = async (reviewId: string) => {
  await Reviews.deleteOne({ _id: reviewId });
};

/**
 * Updates review visibility on website and profile page
 * @param {string} reviewId: Mongo generated review id.
 * @param {number} reported: 1 review was reported, 0 otherwise.
 * @param {number} visible: 1 if want to set review to visible to public, 0 if review is only visible by admin.
 */
export const updateReviewVisibility = async (
  reviewId: string,
  reported: number,
  visible: number
) => {
  await Reviews.updateOne({ _id: reviewId }, { $set: { visible, reported } });
};

/**
 * Approves all pending reviews at once
 */
export const approveAllReviews = async () => {
  await Reviews.updateMany(
    { visible: 0, reported: 0 },
    { $set: { visible: 1 } }
  );
};

/*
 * Functions for the manage admin functionality. Enables grant admin privilege to a
 * user, removing admin privilege from a user, and retrieving all priviliged users.
 * Admin users have privilege "admin" and everyone else has privilege "regular"
 */

export const findAdminUsers = async () => {
  const adminUsers = await Students.find({ privilege: 'admin' }).exec();
  return adminUsers;
};

/**
 * Removes admin privilege from a user
 * @param id netid of user
 * @returns result of the database operation
 */
export const removeAdminPrivilege = async (id: string) => {
  const res = await Students.updateOne(
    { netId: id },
    { $set: { privilege: 'regular' } }
  ).exec();
  return res;
};

/**
 * Gives a specified user admin privilege and assigns a role
 * @param id netid of user
 * @param role role to assign (e.g., 'Designer', 'PM', 'Developer')
 * @returns result of the database operation
 */
export const grantAdminPrivilege = async (id: string, role: string) => {
  const res = await Students.updateOne(
    { netId: id },
    { $set: { privilege: 'admin', role } }
  ).exec();
  return res;
};

/**
 * @param start date
 * @returns review objects that are from a start date.
 */
export const findReviewsByDate = async (start: Date) => {
  const reviews = await Reviews.find(
    { date: { $gte: start } },
    {},
    { sort: { date: -1 } }
  ).exec();

  return reviews;
};

export const getCourseReviews = async (courseId: string) => {
  const reviews = await Reviews.find({ class: courseId }).exec();
  return reviews;
};

export const findStudentByUser = async (user: string) => {
  const student = await Students.findOne({ _id: user }).exec();
  return student;
};

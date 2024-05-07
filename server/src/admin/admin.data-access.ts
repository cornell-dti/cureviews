/* eslint-disable implicit-arrow-linebreak */
import { Classes, ReviewDocument, Reviews, Students } from '../../db/schema';
import { UpdateCourseMetrics } from './admin.type';
import { findCourseById } from '../course/course.data-access';
import { InsertStudentType } from '../auth/auth.type';
import shortid from 'shortid';

export const findStudentById = async (id: string) => {
  const student = await Students.findOne({ _id: id }).exec();
  return student;
};

export const updateCourseMetrics = async (
  review: ReviewDocument,
  state: UpdateCourseMetrics,
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
            : null,
      },
    },
  );
};

/*
 * Function to return all pending reviews in the database.
 */
export const findPendingReviews = async () =>
  await Reviews.find(
    { visible: 0, reported: 0},
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();

/*
 * Function to return all reported reviews in the database.
 */
export const findReportedReviews = async () =>
  await Reviews.find(
    { visible: 0, reported: 1},
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();

/*
 * Function to count reviews by approved, pending, and reported and return the values.
 */
export const findReviewCounts = async () => {
  const approvedCount = await Reviews.countDocuments({ visible : 1}).exec()
  const pendingCount = await Reviews.countDocuments({ visible: 0, reported: 0}).exec()
  const reportedCount = await Reviews.countDocuments({ visible: 0, reported: 1}).exec()
  const result = {
    approved: approvedCount,
    pending: pendingCount,
    reported: reportedCount
  }
  return result
}

/*
 * Function to count the number of approved reviews per class in the database.
 * Count per class is mapped to a CSV string format.
 */
export const createCourseCSV = async () => {
  const approvedReviews = await Reviews.find({ visible: 1}).exec()
  let csv = 'Class,Number of Reviews\n'

  const revsPerCourse: Map<string, number> = new Map()
  await Promise.all(approvedReviews.map(async review => {
    const course = await findCourseById(review.class)
    const title = await course.classSub.toUpperCase() + ' ' + course.classNum

    if (revsPerCourse.has(title)) {
      await revsPerCourse.set(title, revsPerCourse.get(title) + 1)
    } else {
      await revsPerCourse.set(title, 1)
    }
  }))

  revsPerCourse.forEach((count, courseTitle) => {
    csv += courseTitle + ',' + count + '\n'
  })

  return csv
}

// eslint-disable-next-line arrow-body-style
export const findAllReviewsAfterDate = async (date: Date) => {
  return Reviews.find({ date: { $gte: date }, reported: 0 });
};

export const removeReviewById = async (reviewId: string) => {
  await Reviews.deleteOne({ _id: reviewId });
};

export const updateReviewVisibility = async (
  reviewId: string,
  reported: number,
  visible: number,
) => {
  await Reviews.updateOne({ _id: reviewId }, { $set: { visible, reported } });
};

/*
 * Functions for the manage admin functionality. Enables grant admin privilege to a
 * user, removing admin privilege from a user, and retrieving all priviliged users.
 * Admin users have privilege "admin" and everyone else has privilege "regular"
 */

export const findAdminUsers = async () => {
  const adminUsers = await Students.find({ privilege: 'admin' }).exec()
  return adminUsers
}

export const removeAdminPrivilege = async (id: string) => {
  const res = await Students.updateOne({ netId: id }, { $set: {privilege: 'regular'} }).exec()
  return res
}

export const grantAdminPrivilege = async (id: string) => {
  const res = await Students.updateOne({ netId: id }, { $set: {privilege: "admin"} }).exec()
  return res
}

/*
 * If there is an attempt to grant admin privilege to someone not in the database,
 * a new user will be created with the given netid and added to the database.
 */

export const createNewAdminUser = async (id: string) => {

  const admin: InsertStudentType = {
    _id: shortid.generate(),
    firstName: '',
    lastName: '',
    netId: id,
    affiliation: '',
    token: '',
    privilege: 'admin',
  };
  
  const newAdmin = new Students(admin);
  const res = await newAdmin.save();

  return res
}
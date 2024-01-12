import {
  findAllPendingReviews,
  findAllReviewsAfterDate,
  removeReview,
  updateReviewVisibility,
  findStudentById } from "./admin.data-access";
import {
  AdminAddSemesterType,
  AdminPendingReviewType,
  AdminReviewVisibilityType,
  RaffleWinnerRequestType,
  ReportReviewRequestType,
  VerifyAdminType,
} from "./admin.type";

import { findStudent } from "../utils";


import { findAllSemesters } from "../../scripts/utils";
import {
  addAllProfessors,
  resetProfessors,
} from "../../scripts/populate-professors";
import { addAllCourses, addNewSemester } from "../../scripts/populate-courses";
import { COURSE_API_BASE_URL } from "../utils/constants";

export const reportReview = async ({ id }: ReportReviewRequestType) => {
  try {
    await updateReviewVisibility(id, 1, 0);
    return true;
  } catch (err) {
    return false;
  }
};

export const verifyTokenAdmin = async ({ auth }: VerifyAdminType) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);

    if (regex.test(auth.getToken())) {
      const ticket = await auth.getVerificationTicket();
      if (ticket && ticket.email) {
        const user = await findStudent(
          ticket.email.replace("@cornell.edu", ""),
        );
        if (user) {
          return user.privilege === "admin";
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const editReviewVisibility = async ({
  reviewId,
  auth,
  visibility,
  reported,
}: AdminReviewVisibilityType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    await updateReviewVisibility(reviewId, reported, visibility);
    return true;
  }

  return false;
};

export const removePendingReview = async ({
  reviewId,
  auth,
}: AdminPendingReviewType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    await removeReview(reviewId);
    return true;
  }

  return false;
};

export const getPendingReviews = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = await verifyTokenAdmin({ auth });
  if (userIsAdmin) {
    return findAllPendingReviews();
  }

  return null;
};

export const getRaffleWinner = async ({
  startDate,
}: RaffleWinnerRequestType) => {
  const date = new Date(startDate);
  const reviews = await findAllReviewsAfterDate(date);
  if (reviews.length <= 0) {
    return null;
  }

  const student = await findStudentById(reviews[0].user);
  if (!student) {
    return null;
  }

  return student.netId;
};

export const updateAllProfessors = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await addAllProfessors(semesters);

  return result;
};

export const resetAllProfessors = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await resetProfessors(COURSE_API_BASE_URL, semesters);

  return result;
};

export const addAllCoursesAndProfessors = async ({ auth }: VerifyAdminType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const semesters = await findAllSemesters();
  const result = await addAllCourses(COURSE_API_BASE_URL, semesters);

  if (result) {
    return true;
  }

  return false;
};

export const addNewSemesterCoursesAndProfessors = async ({
  auth,
  semester,
}: AdminAddSemesterType) => {
  const userIsAdmin = verifyTokenAdmin({ auth });
  if (!userIsAdmin) {
    return null;
  }

  const result = await addNewSemester(COURSE_API_BASE_URL, semester);
  return result;
};

import { ClassDocument, Reviews, Students } from '../../db/schema';
import { insertUser } from '../auth/auth.controller';
import { VerifyAuthType, VerifyStudentType } from '../auth/auth.type';
import { findCourseById } from '../course/course.data-access';
import { CourseIdRequestType } from '../course/course.type';

export const verifyToken = async ({ auth }: VerifyAuthType) => {
  const ticket = await auth.getVerificationTicket();

  if (!ticket) {
    return null;
  }

  if (ticket.hd === 'cornell.edu') {
    if (!ticket.email) {
      return null;
    }
    const result = await insertUser({ token: ticket });

    if (!result) {
      return null;
    }

    const netId = ticket.email.replace('@cornell.edu', '');
    const student = await findStudent(netId);
    return { netId, student } as VerifyStudentType;
  }
  return null;
};

export const findStudent = async (netId: string) => {
  const student = await Students.findOne({ netId }).exec();
  return student;
};

export const findReview = async (reviewId: string) => {
  const review = await Reviews.findOne({ _id: reviewId }).exec();
  return review;
};

export const findReviewCrossListOR = async (crossListOR) => {
  const reviews = await Reviews.find(
    { visible: 1, reported: 0, $or: crossListOR },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();

  return reviews;
};

export const getCourseById = async ({ courseId }: CourseIdRequestType) => {
  // check: make sure course id is valid and non-malicious
  const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
  if (regex.test(courseId)) {
    return await findCourseById(courseId);
  }

  return null;
};

// Returns an array of objects of containing courseIds
// of cross-listed classes
export const getCrossListOR = (course: ClassDocument) => {
  let crossList;
  let courseId;
  if (course !== undefined) {
    // Why
    crossList = course.crossList;
    courseId = course._id;
  } else {
    return [
      {
        class: courseId,
      },
    ];
  }

  // if there are crossListed Courses, merge the reviews
  if (crossList !== undefined && crossList.length > 0) {
    // format each courseid into an object to input to the find's '$or' search
    const crossListOR = crossList.map((cID) => ({
      class: cID,
    }));
    crossListOR.push({
      class: courseId,
    }); // make sure to add the original course to the list
    return crossListOR;
  }

  return [
    {
      class: courseId,
    },
  ];
};

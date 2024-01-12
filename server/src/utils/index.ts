import shortid from 'shortid';
import { ClassDocument, Reviews, Students } from '../../db/schema';
import { InsertStudentType, TokenPayloadType } from '../auth/auth.type';
import { findCourseById } from '../course/course.data-access';
import { CourseIdRequestType } from '../course/course.type';
import { insertNewStudent } from '../auth/auth.data-access';

export const insertUser = async ({ token }: TokenPayloadType) => {
  try {
    if (!token.email) {
      return false;
    }

    if (token.email.replace('@cornell.edu', '') !== null) {
      const user = await findStudent(token.email.replace('@cornell.edu', ''));

      if (user === null) {
        const newStudent: InsertStudentType = {
          _id: shortid.generate(),
          firstName: token.given_name ? token.given_name : '',
          lastName: token.family_name ? token.family_name : '',
          netId: token.email.replace('@cornell.edu', ''),
          affiliation: '',
          token: '',
          privilege: 'regular',
        };

        await insertNewStudent(newStudent);
      }
    }
  } catch (err) {
    return false;
  }

  return true;
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

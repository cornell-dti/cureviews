import { findCourseById, findCourseByInfo } from './course.data-access';
import { CourseIdRequestType, CourseInfoRequestType } from './course.type';

import { findReviewCrossListOR } from '../utils';

// Returns an array of objects of containing courseIds
// of cross-listed classes
export const getCrossListOR = (course) => {
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
  const course = await findCourseByInfo(number, subject);
  return course;
};

export const getReviewsCrossListOR = async ({
  courseId,
}: CourseIdRequestType) => {
  const course = await getCourseById({ courseId });

  if (course) {
    const crossListOR = getCrossListOR(course);
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

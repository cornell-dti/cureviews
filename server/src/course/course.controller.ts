import { findCourseByInfo } from './course.data-access';
import { CourseIdRequestType, CourseInfoRequestType } from './course.type';

import { findReviewCrossListOR, getCrossListOR, getCourseById } from '../utils';

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

import { findCourseById, findCourseByInfo } from './course.data-access';
import { CourseIdRequestType, CourseInfoRequestType } from './course.type';
import { findReviewCrossListOR } from '../review/review.data-access';
import { getCrossListOR } from '../../../common/CourseCard.js';

export const getCourseByInfo = async ({
  number,
  subject,
}: CourseInfoRequestType) => {
  const course = await findCourseByInfo(number, subject);
  return course;
};

export const getCourseById = async ({ courseId }: CourseIdRequestType) => {
  // check: make sure course id is valid and non-malicious
  const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
  if (regex.test(courseId)) {
    return await findCourseById(courseId);
  }

  return null;
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

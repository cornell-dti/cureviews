import { findCourseById, findCourseByInfo } from './course.data-access';
import { CourseIdDTO, CourseInfoDTO } from './course.dto';
import { findReviewCrossListOR } from '../review/review.data-access';
import { getCrossListOR } from '../../../common/CourseCard.js';

export const getCourseByInfo = async ({ number, subject }: CourseInfoDTO) => {
  const course = await findCourseByInfo(number, subject);
  return course;
};

export const getCourseById = async ({ courseId }: CourseIdDTO) => {
  // check: make sure course id is valid and non-malicious
  const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
  if (regex.test(courseId)) {
    return await findCourseById(courseId);
  }
};

export const getReviewsCrossListOR = async (courseId: CourseIdDTO) => {
  const course = await getCourseById(courseId);

  if (course) {
    const crossListOR = getCrossListOR(course);
    const reviews = await findReviewCrossListOR(crossListOR);
    return reviews;
  }
};

import { findCourseById, findCourseByInfo } from './course.data-access';
import { CourseIdDTO, CourseInfoDTO } from './course.dto';

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

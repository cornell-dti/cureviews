import joi from 'joi';

type CourseEntity = {
  courseId: string;
  subject: string;
  courseNumber: string;
};

export class Course {
  private courseId: string;

  private subject: string;

  private courseNumber: string;

  constructor({ courseId, subject, courseNumber }: CourseEntity) {
    this.courseId = courseId;
    this.subject = subject;
    this.courseNumber = courseNumber;

    this.validate();
  }

  private validate() {
    const searchSchema = joi.object({
      courseId: joi.string().alphanum().required(),
      subject: joi.string().required(),
      courseNumber: joi.number().required()
    });

    const { error } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

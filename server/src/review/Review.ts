import joi from 'joi';

type ReviewEntity = {
  courseId: string;
  reviewId: string;
  text: string;
  difficulty: number;
  rating: number;
  workload: number;
  date: Date;
  visible: 0 | 1;
  reported: 0 | 1;
  professors: string[];
  likes: number;
  isCovid: boolean;
  userId: string;
  grade: string;
  major: string;
};

export class Review {
  private courseId: string;
  private reviewId: string;
  private text: string;
  private difficulty: number;
  private rating: number;
  private workload: number;
  private date: Date;
  private visible: 0 | 1;
  private reported: 0 | 1;
  private professors: string[];
  private likes: number;
  private isCovid: boolean;
  private userId: string;
  private grade: string;
  private major: string;

  constructor({
    courseId,
    reviewId,
    text,
    difficulty,
    rating,
    workload,
    date,
    visible,
    reported,
    professors,
    likes,
    isCovid,
    userId,
    grade,
    major,
  }: ReviewEntity) {
    this.courseId = courseId;
    this.reviewId = reviewId;
    this.text = text;
    this.difficulty = difficulty;
    this.rating = rating;
    this.workload = workload;
    this.date = date;
    this.visible = visible;
    this.reported = reported;
    this.professors = professors;
    this.likes = likes;
    this.isCovid = isCovid;
    this.userId = userId;
    this.grade = grade;
    this.major = major;

    this.validate();
  }

  sanitizeReview() {
    const copy = this;
    copy.userId = '';
    return copy;
  }

  getText() {
    return this.text;
  }
  getDifficulty() {
    return this.difficulty;
  }

  getWorkload() {
    return this.workload;
  }

  getProfessors() {
    return this.professors;
  }

  getIsCovid() {
    return this.isCovid;
  }

  getGrade() {
    if (!this.grade) {
      return null;
    }

    return this.grade;
  }

  getMajor() {
    if (!this.major) {
      return null;
    }

    return this.major;
  }

  getRating() {
    return this.rating;
  }

  private validate() {
    const searchSchema = joi.object({
      reviewId: joi.string().required(),
      text: joi.string().required(),
      difficulty: joi.number().required(),
      rating: joi.number().required(),
      workload: joi.number().required(),
      courseId: joi.string().required(),
      date: joi.date().required(),
      visible: joi.required(),
      reported: joi.required(),
      professors: joi.required(),
      likes: joi.number().required(),
      isCovid: joi.boolean().required(),
      userId: joi.boolean().required(),
      grade: joi.optional(),
      major: joi.optional(),
    });

    const { error, value } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

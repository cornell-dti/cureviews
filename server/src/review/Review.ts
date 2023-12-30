import joi from 'joi';

type ReviewEntity = {
  class: string;
  _id: string;
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
  user: string;
  grade: string;
  major: string[];
};

export class Review {
  private class: string;
  private _id: string;
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
  private user: string;
  private grade: string;
  private major: string[];

  constructor({
    _id,
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
    user: userId,
    grade,
    major,
    class: courseId,
  }: ReviewEntity) {
    this._id = _id;
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
    this.user = userId;
    this.grade = grade;
    this.major = major;
    this.class = courseId;

    this.validate();
  }

  sanitizeReview() {
    const copy = this;
    copy.user = '';
    return copy;
  }
  getReviewId() {
    return this._id;
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
      _id: joi
        .string()
        .regex(new RegExp(/^(?=.*[A-Z0-9])/i))
        .required(),
      text: joi.string().required(),
      difficulty: joi.number().required(),
      rating: joi.number().required(),
      workload: joi.number().required(),
      class: joi.string().required(),
      date: joi.date().required(),
      visible: joi.required(),
      reported: joi.required(),
      professors: joi.required(),
      likes: joi.number().required(),
      isCovid: joi.boolean().required(),
      user: joi.string().required(),
      grade: joi.optional(),
      major: joi.optional(),
    });

    const { error, value } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

import joi from 'joi';

type ReviewEntity = {
  class: string;
  _id: string;
  text: string;
  difficulty: number;
  rating: number;
  workload: number;
  date: Date;
  visible: number;
  reported: number;
  professors: string[];
  likes: number;
  isCovid: boolean;
  user: string;
  grade: string;
  major: string[];
  semester: string;
};

export class Review {
  private class: string;

  private _id: string;

  private text: string;

  private difficulty: number;

  private rating: number;

  private workload: number;

  private date: Date;

  private visible: number;

  private reported: number;

  private professors: string[];

  private likes: number;

  private isCovid: boolean;

  private user: string;

  private grade: string;

  private major: string[];

  private semester: string;

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
    semester
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
    this.semester = semester ? semester : "";

    this.validate();
  }

  getReviewId() {
    return this._id;
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
      semester: joi.optional(),
    });

    const { error } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

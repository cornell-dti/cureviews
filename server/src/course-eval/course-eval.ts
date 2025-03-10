import joi from 'joi';

type ProfileEntity = {
  classSub: string;
  classNum: string;
};

export class CourseEval {
  private classSub: string;
  private classNum: string;

  constructor({ classSub, classNum }: ProfileEntity) {
    this.classSub = classSub;
    this.classNum = classNum;

    this.validate();
  }

  getClassSub() {
    return this.classSub;
  }

  getClassNum() {
    return this.classNum;
  }

  private validate() {
    const searchSchema = joi.object({
      classSub: joi.string().required(),
      classNum: joi.number().required()
    });

    const { error } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

import joi from 'joi';

type AuthEntity = {
  token: string;
};

export class Auth {
  private token: string;

  constructor({ token }: AuthEntity) {
    this.token = token;

    this.validate();
  }

  private validate() {
    const searchSchema = joi.object({
      token: joi.string().required(),
    });

    const { error, value } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

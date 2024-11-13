import joi from 'joi';

type ProfileEntity = {
  netId: string;
};

export class Profile {
  private netId: string;

  constructor({ netId }: ProfileEntity) {
    this.netId = netId;

    this.validate();
  }

  getNetId() {
    return this.netId;
  }

  private validate() {
    const searchSchema = joi.object({
      netId: joi.string().alphanum().required()
    });

    const { error } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

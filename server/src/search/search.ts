import joi from 'joi';

type SearchEntity = {
  query: string;
};

export class Search {
  private query: string;

  constructor({ query }: SearchEntity) {
    this.query = query.replace(/(?=[^\s])\W/g, '');

    try {
      this.validate();
    } catch (err) {
      throw err;
    }
  }

  getQuery() {
    return this.query;
  }

  setQuery(query: string) {
    this.query = query;
  }

  getFirstDigit() {
    return this.query.search(/\d/);
  }

  getFirstSpace() {
    return this.query.search(' ');
  }

  async searchQuery(searchMethod) {
    return await searchMethod(this.query);
  }

  private validate() {
    const searchSchema = joi.object({
      query: joi
        .string()
        .regex(new RegExp(/^(?=.*[A-Z0-9])/i))
        .required(),
    });

    const { error, value } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

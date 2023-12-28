import joi from 'joi';

type SearchEntity = {
  query: string;
};

export class Search {
  private query: string;

  constructor({ query }: SearchEntity) {
    this.query = query;

    this.validate();
  }

  getQuery() {
    return this.query;
  }

  setQuery(query: string) {
    this.query = query;
  }

  private validate() {
    const searchSchema = joi.object({
      query: joi.string().alphanum().required(),
    });

    searchSchema.validate(this);
  }
}

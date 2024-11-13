import joi from 'joi';

type SearchEntity = {
  query: string;
};

export class Search {
  private query: string;

  constructor({ query }: SearchEntity) {
    this.query = query.replace(/(?=[^\s])[^a-zA-Z0-9_-\s]/g, '');

    this.validate();
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

  /**
   * Searches for documents based off of query.
   *
   * @param searchMethod: method that query should be passed into.
   * @returns relevant documents based on query
   */
  async searchQuery(searchMethod) {
    return await searchMethod(this.query);
  }

  private validate() {
    const searchSchema = joi.object({
      query: joi
        .string()
        .regex(new RegExp(/^(?=.*[A-Z0-9])/i))
        .required()
    });

    const { error } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}

import { Classes } from '../../db/schema';

export const findCourse = async (query: string) => {
  return await Classes.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } },
    { sort: { score: { $meta: 'textScore' } } },
  ).exec();
};

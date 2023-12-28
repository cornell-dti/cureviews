import { Reviews } from '../../db/schema';

export const findReviewCrossListOR = async (crossListOR) => {
  console.log(crossListOR);
  const reviews = await Reviews.find(
    { visible: 1, reported: 0, $or: crossListOR },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();

  return reviews;
};

import { ReviewDocument, Reviews } from "../../db/dbDefs";

const getReviewById = async (reviewId: string) => {
  try {
    return await Reviews.findOne({ _id: reviewId }).exec();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getReviewById' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
};

// eslint-disable-next-line import/prefer-default-export
export const getNonNullReviews = async (reviewIds) => {
  const results: ReviewDocument[] = await Promise.all(
    reviewIds.map(async (reviewId) => await getReviewById(reviewId)),
  );
  const reviews = results.filter((review) => review !== null);
  return reviews;
};

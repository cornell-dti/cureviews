import { Reviews } from "../../db/dbDefs";

// eslint-disable-next-line import/prefer-default-export
export const getReviewById = async (reviewId: string) => {
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

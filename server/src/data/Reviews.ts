import { ReviewDocument, Reviews } from "../../db/dbDefs";

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

// eslint-disable-next-line import/prefer-default-export
export const getNonNullReviews = async (reviewIds) => {
  const results: ReviewDocument[] = await Promise.all(
    reviewIds.map(async (reviewId) => await getReviewById(reviewId)),
  );
  const reviews = results.filter((review) => review !== null);
  return reviews;
};

export const updateReviewLiked = async (reviewId, likes, netId) => {
  await Reviews.updateOne(
    { _id: reviewId },
    { $set: { likes } },
    { $pull: { likedBy: netId } },
  ).exec();
};

export const sanitizeReview = (doc: ReviewDocument) => {
  const copy = doc;
  copy.user = "";
  copy.likedBy = [];
  return copy;
};

/**
 * Santize the reviews, so that we don't leak information about who posted what.
 * Even if the user id is leaked, however, that still gives no way of getting back to the netID.
 * Still, better safe than sorry.
 * @param lst the list of reviews to sanitize. Possibly a singleton list.
 * @returns a copy of the reviews, but with the user id field removed.
 */
const sanitizeReviews = (lst: ReviewDocument[]) => lst.map((doc) => sanitizeReview(doc));

export const getReviewsByCourse = async (crossListOR) => {
  const reviews = await Reviews.find(
    { visible: 1, reported: 0, $or: crossListOR },
    {},
    { sort: { date: -1 }, limit: 700 },
  ).exec();
  return sanitizeReviews(reviews);
};

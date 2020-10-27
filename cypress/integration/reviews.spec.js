import { utils } from '../utils.js';

const url = "https://cornellreviews-dev.herokuapp.com";

describe('Submit review', () => {
  it('submitting a review and approving on admin updates course metrics', () => {
    const courseSub = "CS";
    const courseNum = "4410";
    const prof = "Michael George";
    const reviewText = "Test end to end";

    utils.submitAndApproveReview(url, courseSub, courseNum, reviewText, prof, false);
    utils.checkReviewPosted(url, courseSub, courseNum, reviewText);
    utils.checkCourseMetricsNotNaN(url, courseSub, courseNum);
  });
});

describe('Like review', () => {
  it('liking a review, refreshing, and checking the like number incremented', async () => {
    const courseSub = "CS";
    const courseNum = "2110";

    utils.likeAndCheckReview(url, courseSub, courseNum);
  });
});

const utils = require('../utils.js');
const url = "https://cornellreviews-dev.herokuapp.com";

describe('Submit review', () => {
    it('submitting a review and approving on admin updates course metrics', () => {
        let courseSub = "CS";
        let courseNum = "2800";
        let prof = "Michael George";
        let reviewText = "Test end to end";

        utils.submitAndApproveReview(url, courseSub, courseNum, reviewText, prof, false);
        utils.checkReviewPosted(url, courseSub, courseNum, reviewText);
        utils.checkCourseMetricsNotNaN(url, courseSub, courseNum);
    })
  })
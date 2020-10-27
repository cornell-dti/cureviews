/* eslint-disable space-before-blocks */
/* eslint-disable space-infix-ops */
/* eslint-disable prefer-template */
/*
    Looks for a review containing reviewText in the admin page and
    peforms the action by matching the expected button text from actionText.
*/
function adminReview(url, reviewText, actionText) {
  cy.visit(url + '/admin');
  cy.wait(10000);
  cy.contains(reviewText).first().contains(actionText + " Review").click();
}

/*
    Submits a review for the given courseSub, courseNum and fills it out with
    the information given from reviewText, professor, and isCovidAffected.
*/
function submitReview(url, courseSub, courseNum, reviewText, professor, isCovidAffected) {
  cy.visit(url + '/course/' + courseSub + "/" + courseNum);
  cy.wait(500);
  cy.get(".form-input-text").first().type(reviewText);
  cy.get(".react-select-container").first().click();
  cy.get(".react-select__option").contains(professor).click();
  if (isCovidAffected) {
    cy.get(".covidCheckboxInput").click();
  }
  cy.contains("Submit").click();
}

function submitAndApproveReview(url, courseSub, courseNum, reviewText, professor, isCovidAffected) {
  submitReview(url, courseSub, courseNum, reviewText, professor, isCovidAffected);
  cy.wait(4000);
  adminReview(url, reviewText, "Confirm");
  cy.wait(4000);
}

/*
    Asserts that a class does not have "-" (NaN) values for its gauges
*/
function checkCourseMetricsNotNaN(url, courseSub, courseNum) {
  cy.visit(url + '/course/' + courseSub + "/" + courseNum);
  cy.get(".gauge-text-top").each(($gaugeVal) => { cy.wrap($gaugeVal).should('not.contain', "-"); });
}

function checkReviewPosted(url, courseSub, courseNum, reviewText) {
  cy.visit(url + '/course/' + courseSub + "/" + courseNum);
  cy.contains(reviewText).first().should("exist");
}

function getLikeNum (likeText){
  likeText = likeText.split(" ")[1];
  likeText = likeText.replace("(", "").replace(")", "");
  return Number(likeText);
}

function likeAndCheckReview(url, courseSub, courseNum) {
  cy.visit(url + '/course/' + courseSub + "/" + courseNum);
  cy.get(".upvote-text").first().then( ($el)=>{
    let likeNum = getLikeNum($el.text());

    cy.get(".upvote-text").first().click();
    cy.reload();
    cy.get(".upvote-text").first().then( ($p)=>{
      expect( getLikeNum($p.text()) ).to.equal(likeNum+1);
    });
  });

}


module.exports = { utils: { 
  adminReview, submitReview, submitAndApproveReview, checkCourseMetricsNotNaN, checkReviewPosted, likeAndCheckReview
} };

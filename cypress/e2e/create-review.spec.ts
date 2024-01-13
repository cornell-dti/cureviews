/* eslint-disable no-undef */
/* eslint-disable implicit-arrow-linebreak */
before('visit site', () => {
  cy.visit('/');
});

describe('creating a new review', () => {
  it('successful creation of review for "cs 2110"', () => {
    cy.get('[data-cy="search-bar"]').click().type('cs 2110');

    cy.get('[data-cy="search-output"]');
    cy.get('[data-cy="search-result-cs-2110"]').click();

    cy.url().should('contain', 'CS');
    cy.url().should('contain', '2110');
    cy.get('[data-cy="leave-review-button"]').should('exist').click();

    cy.get(':nth-child(3) > .css-yk16xz-control').click();
    cy.get('#react-select-3-option-0').click();

    cy.get('[data-cy="review-comment-textarea"]')
      .click()
      .type('This is a cypress test review.');
    cy.get('[data-cy="review-submit-button"]').click();
  });
});

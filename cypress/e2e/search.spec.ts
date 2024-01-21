/* eslint-disable no-undef */
/* eslint-disable implicit-arrow-linebreak */
before('visit site', () => {
  cy.visit('/');
});

describe('searching by query', () => {
  it('course search - show correct result when typing "CS 2110" from homepage', () => {
    cy.get('[data-cy="search-bar"]').click().type('cs 2110');

    cy.get('[data-cy="search-output"]');
    cy.get('[data-cy="search-result-cs-2110"]').click();

    cy.url().should('contain', 'CS');
    cy.url().should('contain', '2110');
    cy.get('[data-cy="course-title-cs-2110"]').should('exist');
    cy.get('[data-cy="course-reviews"]').should('exist');
  });

  it('professsor search - show correct result when typing "gries" from homepage', () => {
    cy.visit('/');
    cy.get('[data-cy="search-bar"]').click().type('gries');

    cy.get('[data-cy="search-output"]');
    cy.get('[data-cy="search-result-david-gries"]').click();

    cy.url().should('contain', 'David');
    cy.url().should('contain', 'Gries');
    cy.get('[data-cy="results-display-cs-2110"]').should('exist');
  });

  it('professsor search - show correct result when typing "computer science" from homepage', () => {
    cy.visit('/');
    cy.get('[data-cy="search-bar"]').click().type('computer science');

    cy.get('[data-cy="search-output"]');
    cy.get('[data-cy="search-result-cs"]').click();

    cy.url().should('contain', 'major');
    cy.url().should('contain', 'CS');
    cy.get('[data-cy="results-display"]').should('exist');
    cy.get('[data-cy="results-display-cs-2110"]').should('exist');
  });
});

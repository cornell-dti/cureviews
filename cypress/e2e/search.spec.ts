/* eslint-disable no-undef */
/* eslint-disable implicit-arrow-linebreak */
before('visit site', () => {
  cy.visit('/');
});

describe('searching by query', () => {
  it('course search - show correct result when typing "CS 2110" from homepage and clicking', () => {
    cy.get('[data-cy="search-bar"]').click().type('CS 2110');
    cy.wait(1000); // ensure the page has time to load

    cy.get('[data-cy="search-output"]');
    cy.get('[data-cy="search-result-cs-2110"]').click();
    cy.wait(1000); // ensure the page has time to load
    cy.url().should('contain', 'CS');
    cy.url().should('contain', '2110');
    cy.get('[data-cy="course-title-cs-2110"]').should('exist');
    cy.get('[data-cy="course-reviews"]').should('exist');
  });

  it('professsor search - show correct result when typing "gries" from homepage and clicking on "David Gries"', () => {
    cy.visit('/');
    cy.get('[data-cy="search-bar"]').click().type('gries');
    cy.wait(1000); // ensure the page has time to load

    cy.get('[data-cy="search-output"]');
    cy.get('[data-cy="search-result-david-gries"]').click();
    cy.wait(1000); // ensure the page has time to load
    cy.url().should('contain', 'David');
    cy.url().should('contain', 'Gries');
    cy.get('[data-cy="results-display-cs-2110"]').should('exist');
  });
});

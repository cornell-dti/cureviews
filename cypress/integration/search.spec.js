/* eslint-disable no-unused-expressions */
import { utils } from '../utils.js';

const url = "https://cornellreviews-dev.herokuapp.com";

describe('Search for a class exactly', () => {
  it('type a class exactly and check it brings you to the class', () => {
    const courseSub = "CS";
    const courseNum = "4410";

    utils.searchAndPressEnter(url, `${courseSub } ${ courseNum}`);
    cy.url().should('eq', `${url }/course/${ courseSub }/${ courseNum}`);
  });
});

describe('Search for a class by its title', () => {
  it('check that typing most of a class\'s title yields that course in the results', () => {
    const searchText = 'functional programming';
    utils.searchAndPressEnter(url, searchText);

    cy.get(".result-card-title").first().then((el) => {
      const foundCourse = el.text().toLowerCase().includes(searchText);
      expect(foundCourse).to.be.true;
    });
  });
});

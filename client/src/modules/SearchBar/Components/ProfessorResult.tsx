import React from 'react';
import '../Styles/Course.css';
import { Redirect } from 'react-router';
import { Professor } from 'common';

/*
  Professor Component.

  Simple styling component that represents a single professor (an a element).
  Used to list professor in the results of a search in SearchBar.
*/

type Props = {
  professor: Professor;
  query?: string; //optional
  active: boolean;
  enter: 1 | 0;
  mouse: 1 | 0;
  key: string;
};

const ProfessorResult = ({
  professor,
  query,
  active,
  enter,
  mouse,
  key
}: Props) => {
  // generate full human-readable name of class
  const text = professor.fullName;
  const professorURL = professor.fullName.split(' ').join('+');

  //if the element is highlighted and the enter key was pressed, create a Redirect component to go to the class
  if (active && enter === 1) {
    return <Redirect push to={`/results/professor/${professorURL}`}></Redirect>;
  }

  //return classname as a list element
  return (
    //highlight the element if the indexes matched up (the active prop is true)
    //if the mouse is in the list element, highlighting by arrow key stops and follow the mouse hovers
    //if the mouse leaves the list element, highlighting by arrow key continues but from the first element
    <a
      data-cy={`search-result-${professor.fullName
        .split(' ')
        .map((s) => s.toLowerCase())
        .join('-')}`}
      className={
        active && mouse !== 1 ? 'active-class resultbutton' : 'resultbutton'
      }
      href={`/results/professor/${professorURL}`}
    >
      <p className="result-label-professor">Professor</p>
      <p className="result-text">{text}</p>
    </a>
  );
};

export default ProfessorResult;

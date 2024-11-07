import React from 'react';
import '../Styles/Course.css';
import { Redirect } from 'react-router';
import { Class } from 'common';

/*
  Course Component.

  Simple styling component that represents a single course (an li element).
  Used to list courses in the results of a search in SearchBar.

  If a query is provided as a prop, the component is a seach result, so we underline
  and boldface the query text within the title of the course.

  Clicking this component will change the route of the app to render the course's ClassView.
*/

type Props = {
  course: Class;
  query?: string;
  active: boolean;
  enter: number;
  mouse: number;
};

const Course = ({ course, query, active, enter, mouse }: Props) => {
  let text: any =
    course.classSub.toUpperCase() +
    ' ' +
    course.classNum +
    ': ' +
    course.classTitle;

  // if the element is highlighted and the enter key was pressed, create a Redirect component to go to the class
  if (active && enter === 1) {
    return (
      <Redirect
        push
        to={`/course/${course.classSub.toUpperCase()}/${course.classNum}`}
      ></Redirect>
    );
  }

  // check if a query was provided, if so underline parts of the class name
  if (query) {
    const textLowerCase = text.toLowerCase();
    const queryLowerCase = query.toLowerCase();
    const queryIndex = textLowerCase.indexOf(queryLowerCase);

    if (queryIndex !== -1) {
      const startIndex = queryIndex;
      const endIndex = startIndex + queryLowerCase.length;
      text = (
        <span className="ellipsis">
          {text.substring(0, startIndex)}
          <span className="matching-text">
            {text.substring(startIndex, endIndex)}
          </span>
          {text.substring(endIndex)}
        </span>
      );
    } else {
      // based on search technique in server/publications, results without a contains match
      // must be of the form "CS21" or "CS 21". The subject must be a 'match', as well as some
      // text in the substring of query after the subject.

      // substring of query after the subject, without trailing spaces
      const queryWithoutSubject = queryLowerCase
        .substring(course.classSub.length)
        .trim();
      // search substring of text after subject for substring of query.
      const textWithoutSubject = course.classNum + ': ' + course.classTitle;
      const startIndex = textWithoutSubject
        .toLowerCase()
        .indexOf(queryWithoutSubject);
      const endIndex = startIndex + queryWithoutSubject.length;

      // underline the subject and any other matching text
      text = (
        <span className="ellipsis">
          <span>{course.classSub.toUpperCase() + ' '}</span>
          {textWithoutSubject.substring(0, startIndex)}
          <span className="matching-text">
            {textWithoutSubject.substring(startIndex, endIndex)}
          </span>
          {textWithoutSubject.substring(endIndex)}
        </span>
      );
    }
  }

  // return classname as a list element
  return (
    // highlight the element if the indexes matched up (the active prop is true)
    // if the mouse is in the list element, highlighting by arrow key stops and follow the mouse hovers
    // if the mouse leaves the list element, highlighting by arrow key continues but from the first element
    <a
      className={
        active && mouse !== 1 ? 'active-class resultbutton' : 'resultbutton'
      }
      id={course.classSub.toUpperCase() + '_' + course.classNum}
      href={`/course/${course.classSub.toUpperCase()}/${course.classNum}`}
      data-cy={`search-result-${course.classSub.toLowerCase()}-${
        course.classNum
      }`}
    >
      <p className="result-label-course">Course</p>
      <p className="result-text">{text}</p>
    </a>
  );
};

export default Course;

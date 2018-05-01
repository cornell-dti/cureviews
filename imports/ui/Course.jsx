import React, { Component} from 'react';
import PropTypes from 'prop-types';
import "./css/Course.css";

/*
  Course Component.

  Simple styling component that represents a single course (an li element).
  Used to list courses in the results of a search in SearchBar.

  If a query is provided as a prop, the component is a seach result, so we underline
  and boldface the query text within the title of the course.

  Clicking this component will change the route of the app to render the course's ClassView.
*/

export default class Course extends Component {
  render() {
    // generate full human-readable name of class
    var classInfo = this.props.info;
    var text = classInfo.classSub.toUpperCase() + " " + classInfo.classNum + ": " + classInfo.classTitle;

    // check if a query was provided, if so underline parts of the class name
    if (this.props.query) {
      if (text.toLowerCase().indexOf(this.props.query) != -1) {
        startIndex = text.toLowerCase().indexOf(this.props.query);
        endIndex = startIndex + this.props.query.length;
        text = <div>{text.substring(0,startIndex)}<span className='found'>{text.substring(startIndex,endIndex)}</span>{text.substring(endIndex)}</div>
      } else {
        // based on search technique in server/publications, results without a contains match 
        // must be of the form "CS21" or "CS 21". The subject must be a 'match', as well as some 
        // text in the substring of query after the subject.

        // substring of query after the subject, without trailing spaces
        queryWithoutSubject = this.props.query.substring(classInfo.classSub.length).trim(); 
        // search substring of text after subject for substring of query.
        textWithoutSubject = classInfo.classNum + ": " + classInfo.classTitle;
        startIndex = textWithoutSubject.toLowerCase().indexOf(queryWithoutSubject);
        endIndex = startIndex + queryWithoutSubject.length;

        // underline the subject and any other matching text
        text = 
        <div>
          <span className='found'>{classInfo.classSub.toUpperCase() + " "}</span>
          {textWithoutSubject.substring(0,startIndex)}<span className='found'>{textWithoutSubject.substring(startIndex,endIndex)}</span>{textWithoutSubject.substring(endIndex)}
        </div>
        
      }
    } else {
      text = <div>{text}</div>
    }

    // return classname as a list element
    return (
      <li className="classbutton" id={classInfo.classSub.toUpperCase() + "_" + classInfo.classNum } >
          <a className="text-style-1" href={`/course/${classInfo.classSub.toUpperCase()}/${classInfo.classNum}`}>
              {text}
          </a>
      </li>
    );
  }
}

// Requres course informaiton (database object) to generate course title, and uses the query to
// determine styling of output
Course.propTypes = {
  info: PropTypes.object.isRequired,
  query: PropTypes.string //optional
};

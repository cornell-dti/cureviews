import React, { Component} from 'react';
import PropTypes from 'prop-types';
import "./css/Course.css";

/*
  Course Component.

  Simple styling component that represents a single course (an li element).
  Used to list courses in PopularClasses and in the results of a search in SearchBar.

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

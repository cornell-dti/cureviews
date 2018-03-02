import React, { Component, PropTypes } from 'react';
import "./css/Course.css";
// Course component - represents a single course to be shown to the user in a course search.
// Clicking this component will change the route of the app to show course details.
export default class Course extends Component {
  //props:
  // info, a database object containing all of this class's data.
  // query, string within the details of this course if it is a search result
  render() {
    var classInfo = this.props.info;
    var text = classInfo.classSub.toUpperCase() + " " + classInfo.classNum + ": " + classInfo.classTitle;
    if (this.props.query) {
      if (text.toLowerCase().indexOf(this.props.query) != -1) {
        startIndex = text.toLowerCase().indexOf(this.props.query);
        endIndex = startIndex + this.props.query.length;
        text = <div>{text.substring(0,startIndex)}<span className='found'>{text.substring(startIndex,endIndex)}</span>{text.substring(endIndex)}</div>
      }
    } else {
      text = <div>{text}</div>
    }
    return (
      <li className="classbutton" id={classInfo.classSub.toUpperCase() + "_" + classInfo.classNum } >
          <a className="text-style-1" href={`/course/${classInfo.classSub.toUpperCase()}/${classInfo.classNum}`}>
              {text}
          </a>
      </li>
    );
  }
}

Course.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  info: PropTypes.object.isRequired,
  query: PropTypes.string
};

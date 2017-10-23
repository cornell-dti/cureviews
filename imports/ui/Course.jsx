import React, { Component, PropTypes } from 'react';
import "./css/Course.css";
// Course component - represents a single course to be shown to the user in a course search.
// Clicking this component will change the state of the app to show course details.
export default class Course extends Component {
  //props:
  // info, a database object containing all of this class's data.
  render() {
    var classId = this.props.info._id;
    return (
      <div id = "classbutton">
        <li id={classId} onClick={() => this.props.handler(classId)}>{this.props.info.classFull}</li>
      </div>
    );
  }
}

Course.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  info: PropTypes.object.isRequired,
  handler: PropTypes.func.isRequired
};

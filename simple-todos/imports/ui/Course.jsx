import React, { Component, PropTypes } from 'react';

// Task component - represents a single todo item
export default class Course extends Component {
  //props:
  // info, a database object containing all of this class's data.
  render() {
    var classId = this.props.info._id;
    return (
      <li id={classId} onClick={() => this.props.handler(classId)}>{this.props.info.classFull}</li>
    );
  }
}

Course.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  info: PropTypes.object.isRequired,
  handler: PropTypes.func.isRequired
};

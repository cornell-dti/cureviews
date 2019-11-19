import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/FilteredResult.css';
import Gauge from 'react-summary-gauge-2';
import { lastOfferedSems, lastSem, getGaugeValues } from './js/CourseCard.js';
import PreviewCard from './PreviewCard';

/*
  Filtered Result Component.
*/

export default class FilteredResult extends Component {
  constructor(props) {
    super(props);
    // set gauge values
    this.state = {
      course: this.props.course,
      current_index: this.props.index
    };


  }


  render() {
    let theClass = this.props.course;

    // Creates Url that points to each class page on Cornell Class Roster
    let url = "https://classes.cornell.edu/browse/roster/"
      + lastSem(theClass.classSems) + "/class/"
      + theClass.classSub.toUpperCase() + "/"
      + theClass.classNum;

    // Calls function in CourseCard.js that returns a clean version of the last semster class was offered
    let offered = lastOfferedSems(theClass);

    return (
      <li className="card" style={{ border: this.props.border_color }}
        onClick={() => { this.props.previewHandler(this.state.course, this.state.current_index) }}>
        <div className="card-body">
          <h1 className="card-title">
            {theClass.classTitle}
          </h1>
          <h2 className="card-subtitle mb-2 text-muted">
            {theClass.classSub.toUpperCase() + " " + theClass.classNum}
          </h2>
          <p>
            <strong>Overall Rating: </strong>
            {this.state.course.classRating}/5
            </p>
        </div>
      </li>
    );
  }
}


// takes in the database object representing this review
FilteredResult.propTypes = {
  course: PropTypes.object.isRequired,
  previewHandler: PropTypes.func.isRequired,
  border_color: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

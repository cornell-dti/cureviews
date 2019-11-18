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
      course: this.props.course
    };


  }

  // componentDidMount() {
  //   this.updateColors();
  // }

  // updateColors() {
  //   if (3.0 <= this.state.rating && this.state.rating < 4.0) {
  //     this.setState({
  //       ratingColor: "#f9cc30"
  //     })
  //   }
  //   else if (4.0 <= this.state.rating && this.state.rating <= 5.0) {
  //     this.setState({
  //       ratingColor: "#53B277"
  //     })
  //   }

  //   if (0 <= this.state.diff && this.state.diff < 3.0) {
  //     this.setState({
  //       diffColor: "#53B277"
  //     })
  //   }
  //   else if (3.0 <= this.state.diff && this.state.diff < 4.0) {
  //     this.setState({
  //       diffColor: "#f9cc30"
  //     })
  //   }

  //   if (0 <= this.state.workload && this.state.workload < 3.0) {
  //     this.setState({
  //       workloadColor: "#53B277"
  //     })
  //   }
  //   else if (3.0 <= this.state.workload && this.state.workload < 4.0) {
  //     this.setState({
  //       workloadColor: "#f9cc30"
  //     })
  //   }

  // }


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
      <li id="result-li" onClick={() => this.props.previewHandler(this.state.course)}>
        <div id="course-details">
          <div>
            <h1 className="class-title top-margin">
              {theClass.classTitle}
            </h1>
            <h2>
              {theClass.classSub.toUpperCase() + " " + theClass.classNum}
            </h2>
            <p className="class-info spacing-large top-margin">
              <strong>Overall Rating: </strong>
              {this.state.rating}/5
            </p>
          </div>
        </div>
      </li>
    );
  }
}


// takes in the database object representing this review
FilteredResult.propTypes = {
  course: PropTypes.object.isRequired,
  previewHandler: PropTypes.func.isRequired
};

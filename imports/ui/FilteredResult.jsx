import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/CourseCard.css';
import Gauge from 'react-summary-gauge-2';
import { lastOfferedSems, lastSem, getGaugeValues } from './js/CourseCard.js';

/*
  Filtered Result Component.
*/

export default class FilteredResult extends Component {
  constructor(props) {
    super(props);
    // set gauge values
    this.state = {
      id: this.props.course._id,
      rating: this.props.course.classRating,
      ratingColor: this.props.course.classRatingColor,
      diff: this.props.course.classDifficulty,
      diffColor: this.props.course.classDifficultyColor,
      workload: this.props.course.classWorkload,
      workloadColor: this.props.course.classWorkloadColor,
      grade: this.props.course.classGrade,
      gradeNum: 0,
    };


  }


  render() {
    var theClass = this.props.course;

    // Creates Url that points to each class page on Cornell Class Roster
    var url = "https://classes.cornell.edu/browse/roster/"
      + lastSem(theClass.classSems) + "/class/"
      + theClass.classSub.toUpperCase() + "/"
      + theClass.classNum;

    // Calls function in CourseCard.js that returns a clean version of the last semster class was offered
    var offered = lastOfferedSems(theClass);

    return (
      <li>
        <div id="coursedetails">
          <div>
            <h1 className="class-title top-margin">
              {theClass.classSub.toUpperCase() + " " + theClass.classNum + ": " + theClass.classTitle}
            </h1>
            <p className="class-info spacing-large top-margin">
              <strong>Offered: </strong>
              {offered}
            </p>
          </div>
          <div className="panel panel-default top-margin-medium panel-radius">
            <div className="panel-body">
              <section>
                <div className="row" id="gaugeHolder">
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <Gauge value={this.state.rating} width={160} height={120} color={this.state.ratingColor} max={5} label="Overall Rating" />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <Gauge value={this.state.diff} width={160} height={120} color={this.state.diffColor} max={5} label="Difficulty" />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <Gauge value={this.state.workload} width={160} height={120} color={this.state.workloadColor} max={5} label="Workload" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </li>
    );
  }
}


// takes in the database object representing this review
FilteredResult.propTypes = {
  course: PropTypes.object.isRequired
};

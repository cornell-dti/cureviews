import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/FilteredResult.css';
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
      ratingColor: "E64458",
      diff: this.props.course.classDifficulty,
      diffColor: "E64458",
      workload: this.props.course.classWorkload,
      workloadColor: "E64458",
      grade: this.props.course.classGrade,
      gradeNum: 0,
    };


  }

  componentDidMount() {
    this.updateColors();
  }

  updateColors() {
    if (3.0 <= this.state.rating && this.state.rating < 4.0) {
      this.setState({
        ratingColor: "#f9cc30"
      })
    }
    else if (4.0 <= this.state.rating && this.state.rating <= 5.0) {
      this.setState({
        ratingColor: "#53B277"
      })
    }

    if (0 <= this.state.diff && this.state.diff < 3.0) {
      this.setState({
        diffColor: "#53B277"
      })
    }
    else if (3.0 <= this.state.diff && this.state.diff < 4.0) {
      this.setState({
        diffColor: "#f9cc30"
      })
    }

    if (0 <= this.state.workload && this.state.workload < 3.0) {
      this.setState({
        workloadColor: "#53B277"
      })
    }
    else if (3.0 <= this.state.workload && this.state.workload < 4.0) {
      this.setState({
        workloadColor: "#f9cc30"
      })
    }

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
      <li id="result-li">
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
        </div>
        <div className="panel panel-default top-margin-medium panel-radius" id="gauge">
          <div className="panel-body" id="gauge-body">
            <section>
              <div className="row" id="gaugeHolder">
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <Gauge value={this.state.rating} left={50} width={160} height={120} color={this.state.ratingColor} max={5} label="Overall Rating" />
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <Gauge value={this.state.diff} left={150} width={160} height={120} color={this.state.diffColor} max={5} label="Difficulty" />
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <Gauge value={this.state.workload} left={250} width={160} height={120} color={this.state.workloadColor} max={5} label="Workload" />
                </div>
              </div>
            </section>
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

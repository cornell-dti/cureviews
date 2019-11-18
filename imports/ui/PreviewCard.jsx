import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/PreviewCard.css';
import Gauge from 'react-summary-gauge-2';
import { lastOfferedSems, lastSem, getGaugeValues } from './js/CourseCard.js';
import Review from './Review.jsx';

/*
  Filtered Result Component.
*/

export default class PreviewCard extends Component {
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
      topReview: {}
    };

    this.updateColors = this.updateColors.bind(this);

  }

  componentDidMount() {
    this.updateColors();
  }

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this.setState({
        id: this.props.course._id,
        rating: this.props.course.classRating,
        diff: this.props.course.classDifficulty,
        workload: this.props.course.classWorkload,
      },() => this.updateColors());
      
      Meteor.call("getReviewsByProfessor", "David Gries", (err, reviews) => {
        if (!err && reviews) {
          console.log("returned reviews");
          // Sort reviews according to most likes
          reviews.sort((a, b) => (((a.likes) ? a.likes : 0) < ((b.likes) ? b.likes : 0)) ? 1 : -1)
          this.setState({
            topReview: reviews[0]
          });
        }
        else {
          console.log("no prof reviews");
        }
      });

    }
  }

  updateColors() {
    console.log("workload" + this.state.workload);
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
    else {
      this.setState({
        ratingColor: "#E64458"
      })
    }

    if (0 < this.state.diff && this.state.diff < 3.0) {
      this.setState({
        diffColor: "#53B277"
      })
    }
    else if (3.0 <= this.state.diff && this.state.diff < 4.0) {
      this.setState({
        diffColor: "#f9cc30"
      })
    }
    else {
      this.setState({
        diffColor: "#E64458"
      })
    }

    if (0 < this.state.workload && this.state.workload < 3.0) {
      this.setState({
        workloadColor: "#53B277"
      })
    }
    else if (3.0 <= this.state.workload && this.state.workload < 4.0) {
      this.setState({
        workloadColor: "#f9cc30"
      })
    }
    else {
      this.setState({
        workloadColor: "#E64458"
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
        <div className="preview-panel">
          <div className="row">
            <div className="col-md-12 col-sm-12">
              <p className="">
                {theClass.classTitle}
              </p>
              <p>
                {theClass.classSub.toUpperCase() + " " + theClass.classNum}
              </p>
            </div>
          </div>
          <div className="row" id="gaugeHolder">
            <div className="col-md-12 col-sm-12">
              <div className="col-md-4 col-sm-4 col-xs-12">
                <Gauge value={this.state.rating} left={50} width={100} height={75} color={this.state.ratingColor} max={5} label="Overall Rating" />
              </div>
              <div className="col-md-4 col-sm-4 col-xs-12">
                <Gauge value={this.state.diff} left={150} width={100} height={75} color={this.state.diffColor} max={5} label="Difficulty" />
              </div>
              <div className="col-md-4 col-sm-4 col-xs-12">
                <Gauge value={this.state.workload} left={250} width={100} height={75} color={this.state.workloadColor} max={5} label="Workload" />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-sm-12">
              <p>Top Review</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-sm-12">
              {Object.keys(this.state.topReview).length !== 0 && 
              
              <Review key={this.state.topReview._id} info={this.state.topReview} />
              
              }
            </div>
          </div>
        </div>

    );
  }
}


// takes in the database object representing this review
PreviewCard.propTypes = {
  course: PropTypes.object.isRequired
};

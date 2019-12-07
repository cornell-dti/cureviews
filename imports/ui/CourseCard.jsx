import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import Gauge from 'react-summary-gauge-2';
import './css/CourseCard.css';
import { lastOfferedSems, lastSem, getGaugeValues } from './js/CourseCard.js';

/*
  Course Card Component.

  Container Component that returns a paenl of aggregated information about a class:
  Displays:
    - course title
    - link to course roster
    - gauges for quality, difficulty, workload
    - semsters last offered
    - attendance requirement
*/

export class CourseCard extends Component {
  constructor(props) {
    super(props);

    // default gauge values
    this.defaultGaugeState = {
      rating: "-",
      ratingColor: "#E64458",
      diff: "-",
      diffColor: "#E64458",
      workload: "-",
      workloadColor: "#E64458",
    };

    // initialize state as default gauge values
    this.state = this.defaultGaugeState;
  }

  // Whenever the incoming props change (i.e, the database of reviews for a class
  // is updated) trigger a re-render by updating the gauge values in the local state.
  componentWillReceiveProps(nextProps) {
    this.updateState(nextProps.course, nextProps.reviews);
  }

  // Recalculate gauge values and other metrics to update the local state
  updateState(selectedClass, allReviews) {
    if (selectedClass !== null && selectedClass !== undefined) {
      // gather data on the reviews and set mandatory flags.
      if (allReviews.length !== 0) {
        // set the new state to the collected values. Calls getGaugeValues function in CourseCard.js
        this.setState(getGaugeValues(allReviews));
      } else {
        this.setState(this.defaultGaugeState); //default gauge values
      }
    }
    else {
      this.setState(this.defaultGaugeState); //default gauge values
    }
  }

  render() {
    const theClass = this.props.course;

    // Creates Url that points to each class page on Cornell Class Roster
    const url = "https://classes.cornell.edu/browse/roster/"
      + lastSem(theClass.classSems) + "/class/"
      + theClass.classSub.toUpperCase() + "/"
      + theClass.classNum;

    // Calls function in CourseCard.js that returns a clean version of the last semster class was offered
    const offered = lastOfferedSems(theClass);

    return (
      <div id="coursedetails">
        <h1 className="coursecard-class-title top-margin">
          {theClass.classSub.toUpperCase() + " " + theClass.classNum + ": " + theClass.classTitle}
        </h1>
        <div href={url} target="_blank"> {/* Forces link onto next line */}
          <a className="cornellClassLink" href={url}>Class Roster <img className="padding-bottom" src="https://img.icons8.com/windows/32/000000/external-link.png" width="3%" height="3%" ></img></a>
        </div>
        <p className="class-info spacing-large top-margin">
          <strong>Offered: </strong>
          {offered}
        </p>
        <div className="panel panel-default top-margin-medium panel-radius">
          <div className="panel-body">
            <section>
              <div className="row" id="gaugeHolder">
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <Gauge value={this.state.rating} left={0} width={160} height={120} color={this.state.ratingColor} max={5} label="Overall Rating" />
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <Gauge value={this.state.diff} left={0} width={160} height={120} color={this.state.diffColor} max={5} label="Difficulty" />
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <Gauge value={this.state.workload} left={0} width={160} height={120} color={this.state.workloadColor} max={5} label="Workload" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

// Component requires course information and all reviews for the course.
// Parent class provides the course's database object, while withTracker
// grabs this course's reviews.
CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  reviews: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab reviews.
// The component will automatically re-render if the reviews change.
export default withTracker(props => {
  const subscription = Meteor.subscribe('reviews', props.course._id, 1, 0); //get only visible unreported reviews
  const loading = !subscription.ready();
  const reviews = Reviews.find({}).fetch();
  return {
    reviews, loading,
  };
})(CourseCard);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import Gauge from './Gauge.jsx';
import Form from './Form.jsx';
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
    this.onFormChange = this.onFormChange.bind(this);
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

  // Updates the last time user typed in the form textbox
  // Used so that the popup doesn't show while user is typing where
  onFormChange(e) {
      this.setState({lastTyped:new Date().getTime()});
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
      <div className="coursecard-container">
        <h1 className="coursecard-class-title top-margin">
          {theClass.classTitle}
        </h1>
        <p className="coursecard-class-info top-margin">
          {theClass.classSub.toUpperCase() + " " + theClass.classNum + ", " + offered}
        </p>
        <Form onChange={this.onFormChange} course={theClass} inUse={true}/>
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

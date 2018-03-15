import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import Review from './Review.jsx';
import RecentReview from './RecentReview.jsx';

/*
  Course Reviews Component. Takes in the course's database id and returns:

  - if course Id is valid:
    a list of all reviews for a course, sorted by date.
    The component also handles user reporting of reviews.

  -if course id = -1:
    - list of 5 most recent reviews added to the database
*/
export class CourseReviews extends Component {
  constructor(props) {
    super(props);

    this.reportReview.bind(this);
  }

  // Report this review
  reportReview(review) {
    console.log(review);
    Meteor.call('reportReview', review, (error, result) => {
      if (!error && result === 1) {
        console.log("reported review #" + review._id);
      } else {
        console.log(error)
      }
    });
  }

  renderReviews() {
    if (this.props.courseId === "-1") {
      return this.props.reviews.map((review) => (
        <RecentReview key={review._id} info={review} reportHandler={this.reportReview} />
      ));
    } else {
      return this.props.reviews.map((review) => (
        <Review key={review._id} info={review} reportHandler={this.reportReview}/>
      ));
    }
  }

  render() {
    var title = "Past Reviews";
    if (this.props.courseId === "-1") {
      title = "Recent Reviews";
    }
    return (
      <section>
          <legend className="subheader">{title}</legend>
          <div className="panel panel-default" id="reviewpanel">
              <div>
                  <ul id="reviewul">
                      {this.renderReviews()}
                  </ul>
              </div>
          </div>
      </section>
    );
  }
}

// Component requires a course object pivided by a parent component, and uses
// withTracker to get a list of reviews.
CourseReviews.propTypes = {
  courseId: PropTypes.string.isRequired,
  reviews: PropTypes.array.isRequired,
};

// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default withTracker(props => {
  const subscription = Meteor.subscribe('reviews', props.courseId, 1, 0); //get only visible unreported reviews for this course
  const loading = !subscription.ready();
  const reviews = Reviews.find({}).fetch();
  return {
    reviews, loading,
  };
}) (CourseReviews);

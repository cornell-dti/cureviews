import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Reviews } from '../api/classes.js';
import Review from './Review.jsx';

// Task component - represents a single todo item
export class Update extends Component {
  constructor(props) {
    super(props);
  }

  //approve a review
  approveReview(review) {
    Meteor.call('makeVisible', review, (error, result) => {
      if (!error && result==1) {
        console.log("approved review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  //remove a review
  removeReview(review) {
    Meteor.call('removeReview', review, (error, result) => {
      if (!error && result==1) {
        console.log("removed review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  //show all reviews that have not been approved
  renderReviews() {
    return this.props.reviewsToApprove.map((review) => (
      //create a new class "button" that will set the selected class to this class when it is clicked.
      <Review key={review._id} info={review} removeHandler={this.removeReview} approveHandler={this.approveReview}/>
    ));
  }

  render() {
    return (
      <div>
        <ul>
          {this.renderReviews()}
        </ul>
      </div>
    )
  };
}

Update.propTypes = {
  reviewsToApprove: PropTypes.array.isRequired,
  loading: React.PropTypes.bool
};

export default createContainer((props) => {
  const subscription = Meteor.subscribe('reviews', null, 0); //get unapproved reviews
  const loading = !subscription.ready();
  const reviewsToApprove = Reviews.find({}).fetch();
  return {
    reviewsToApprove, loading,
  };
}, Update);

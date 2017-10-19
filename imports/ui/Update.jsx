import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Reviews } from '../api/classes.js';
import UpdateReview from './UpdateReview.jsx';

// Holder component for moderator interface. Shows all unapproved reviews and
// allows the moderator to remove or approve them.
export class Update extends Component {
  constructor(props) {
    super(props);

    this.approveReview.bind(this);
    this.removeReview.bind(this);
  }

  //approve a review
  approveReview(review) {
    Meteor.call('makeVisible', review, (error, result) => {
      if (!error && result==1) {
        //console.log("approved review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  //remove a review
  removeReview(review) {
    Meteor.call('removeReview', review, (error, result) => {
      if (!error && result==1) {
        //console.log("removed review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  //add the current semester's class data to the database. Should run once a semester
  addNewSem(initiate) {
    console.log("updating to new semester")
    Meteor.call('addNewSemester', initiate, (error, result) => {
      if (!error && result==1) {
        console.log("Added new semester courses");
      } else {
        console.log(error)
      }
    });
  }

  //show all reviews that have not been approved but not reported
  renderUnapprovedReviews() {
    remFunc = this.removeReview;
    appFunc = this.approveReview;
    return this.props.reviewsToApprove.map(function(review) {
      if (review.reported != 1) {
         return <UpdateReview key={review._id} info={review} removeHandler={remFunc} approveHandler={appFunc}/>;
      }
    });
  }

  //show reviews that were reported
  renderReportedReviews() {
    remFunc = this.removeReview;
    appFunc = this.approveReview;
    return this.props.reviewsToApprove.map(function(review) {
      //create a new class "button" that will set the selected class to this class when it is clicked.
      if (review.reported == 1) {
        return <UpdateReview key={review._id} info={review} removeHandler={remFunc} approveHandler={appFunc}/>
      }
    });
  }

  render() {
    return (
      <div>
        <h2>Admin Interface</h2>
        <button onClick={()=> this.addNewSem(true)}>Add New Semester</button>
        <div>
          <ul>
            {this.renderUnapprovedReviews()}
          </ul>
        </div>
        <div>
          <ul>
            {this.renderReportedReviews()}
          </ul>
        </div>
      </div>
    )
  };
}

Update.propTypes = {
  reviewsToApprove: PropTypes.array.isRequired,
  loading: React.PropTypes.bool
};

export default createContainer((props) => {
  const subscription = Meteor.subscribe('reviews', "", 0, null); //get unapproved or reported reviews
  const loading = !subscription.ready();
  const reviewsToApprove = Reviews.find({}).fetch();
  console.log(reviewsToApprove);
  return {
    reviewsToApprove, loading,
  };
}, Update);

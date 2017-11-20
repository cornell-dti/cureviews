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
    this.unReportReview.bind(this);
  }

  //approve a review
  approveReview(review) {
    Meteor.call('makeVisible', review, (error, result) => {
      if (!error && result === 1) {
        //console.log("approved review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  //remove a review
  removeReview(review) {
    Meteor.call('removeReview', review, (error, result) => {
      if (!error && result === 1) {
        console.log("removed review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  //unflag a reported review
  unReportReview(review) {
    Meteor.call('undoReportReview', review, (error, result) => {
      if (!error && result === 1) {
        //console.log(" review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  //add the current semester's class data to the database. Should run once a semester
  addNewSem(initiate) {
    console.log("updating to new semester");
    Meteor.call('addNewSemester', initiate, (error, result) => {
      if (!error && result === 1) {
        console.log("Added new semester courses");
      } else {
        console.log(error)
      }
    });
  }

  //add cross-listed courses
  addCrossList(initiate) {
    console.log("updating to new semester");
    Meteor.call('addCrossList', initiate, (error, result) => {
      if (!error && result === 1) {
        console.log("Added cross-listings");
      } else {
        console.log(error)
      }
    });
  }

  //add all courses to the db
  addAllCourses(initiate) {
    console.log("adding all classes");
    Meteor.call('addAll', initiate, (error, result) => {
      if (!error && result === 1) {
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
      if (review.reported !== 1) {
         return <UpdateReview key={review._id} info={review} removeHandler={remFunc} approveHandler={appFunc}/>;
      }
    });
  }

  //show reviews that were reported
  renderReportedReviews() {
    remFunc = this.removeReview;
    appFunc = this.approveReview;
    unRepFunc = this.unReportReview;
    return this.props.reviewsToApprove.map(function(review) {
      //create a new class "button" that will set the selected class to this class when it is clicked.
      if (review.reported === 1) {
        return <UpdateReview key={review._id} info={review} removeHandler={remFunc} approveHandler={appFunc} unReportHandler={unRepFunc}/>
      }
    });
  }

  render() {
    return (
      <div>
        <h2>Admin Interface</h2>
        <button onClick={()=> this.addNewSem(true)}>Add New Semester</button>
        <button onClick={()=> this.addAllCourses(true)}>Add All Courses</button>
        <button onClick={()=> this.addCrossList(true)}>Add Cross-Listings</button>
        <div>
          <h3>New Reviews</h3>
          <ul>
            {this.renderUnapprovedReviews()}
          </ul>
        </div>
        <div>
          <h3>Reported Reviews</h3>
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

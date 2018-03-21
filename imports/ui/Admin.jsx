import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import UpdateReview from './UpdateReview.jsx';
import "./css/Admin.css";
/*
  Admin Interface Component.

  Container component shows the admin a list of reviews that need approval,
  a list of reviews that have been reported, with buttons to approve, delete,
  and unreport reviews. Also gives access to buttons that populate and update
  the Classes collection in the local meteor database.

  Can only be via password access from the Login component.
*/

export class Admin extends Component {
  constructor(props) {
    super(props);

    this.approveReview.bind(this);
    this.removeReview.bind(this);
    this.unReportReview.bind(this);
  }

  // Call when user asks to approve a review. Accesses the Reviews database
  // and changes the review with this id to visible.
  approveReview(review) {
    Meteor.call('makeVisible', review, (error, result) => {
      if (!error && result === 1) {
        //console.log("approved review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  // Call when user asks to remove a review. Accesses the Reviews database
  // and deletes the review with this id.
  removeReview(review) {
    Meteor.call('removeReview', review, (error, result) => {
      if (!error && result === 1) {
        //console.log("removed review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  // Call when user asks to un-report a reported review. Accesses the Reviews database
  // and changes the reported flag for this review to false.
  unReportReview(review) {
    Meteor.call('undoReportReview', review, (error, result) => {
      if (!error && result === 1) {
        //console.log(" review " + review._id);
      } else {
        console.log(error)
      }
    });
  }

  // Call when user selects "Add New Semester" button. Runs code to check the
  // course API for new classes and updates classes existing in the database.
  // sShould run once a semester, when new classes are added to the roster.
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

  // Call when user selects "Add Cross-Listings" button. Runs code to store
  // id's of cross-listed classes in the database. Should only be run once
  // when the app is initialzied, right after adding all classes to the
  // database using addAllCourses.
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

  // Call when user selects "Add All Classes" button. Scrapes the Cornell
  // Course API to store all classes in the local database. Should only be run
  // once when the app is initialzied.
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

  // Show a list of all reviews that have not been approved. Will allow admin to
  // approve or delete with the click of button.
  renderUnapprovedReviews() {
    remFunc = this.removeReview;
    appFunc = this.approveReview;
    return this.props.reviewsToApprove.map(function(review) {
      if (review.reported !== 1) {
         return <UpdateReview key={review._id} info={review} removeHandler={remFunc} approveHandler={appFunc}/>;
      }
    });
  }

  // Show a list of all reviews that were reported. Will allow admin to approve
  // or delete with the click of button.
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
      <div className="container whiteBg">
        <h2>Admin Interface</h2>

        <br />

        <div className="width-90">
          <div className="panel panel-default">
            <div className="panel-body">
              <div className="btn-group btn-group-justified" role="group">
                <div className="btn-group separate-buttons" role="group">
                  <button type="button" className="btn btn-warning" onClick={()=> this.addNewSem(true)}>Add New Semester</button>
                </div>
                <div className="btn-group separate-buttons" role="group">
                  <button type="button" className="btn btn-warning" onClick={()=> this.addAllCourses(true)}>Add All Courses</button>
                </div>
                <div className="btn-group separate-buttons" role="group">
                  <button type="button" className="btn btn-warning" onClick={()=> this.addCrossList(true)}>Add Cross-Listings</button>
                </div>
              </div>
            </div>
          </div>

          <br />

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">New Reviews</h3>
            </div>
            <div className="panel-body">
              <ul>
                {this.renderUnapprovedReviews()}
              </ul>
            </div>
          </div>

          <br />

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Reported Reviews</h3>
            </div>
            <div className="panel-body">
              <ul>
                {this.renderReportedReviews()}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  };
}

// requires a list of reivews not visible to regular users
Admin.propTypes = {
  reviewsToApprove: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab reivews.
// The component will automatically re-render when new views are added to the database.
export default withTracker(props => {
  const subscription = Meteor.subscribe('reviews', "", 0, null); //get unapproved or reported reviews
  const loading = !subscription.ready();
  const reviewsToApprove = Reviews.find({}).fetch();
  return {
    reviewsToApprove,
  };
}) (Admin);

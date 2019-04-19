import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import UpdateReview from './UpdateReview.jsx';
import "./css/Admin.css";
import { Bert } from 'meteor/themeteorchef:bert'; // alert library, https://themeteorchef.com/tutorials/client-side-alerts-with-bert
import { createVerify } from 'crypto';
import { Session } from 'meteor/session';

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

    this.state = {
      disableInit: false,
      disableNewSem: false,
      doubleClick: false,
      loadingInit: 0, // 0: starting state, no attempt to init database,
      // 1: database init function was called, scraper is running
      // 2: database init function has completed
      loadingSemester: 0, // 0: starting state, no attempt to update database,
      // 1: database semester update function was called, scraper is running
      // 2: database semester update function has completed
      loadingProfs: 0, // 0: starting state, no attempt to update database,
      // 1: database professor clear function was called, scraper is running
      // 2: database professor update function has completed
      resettingProfs: 0, // 0: starting state, no attempt to clear database,
      // 1: database professor clearing function was called, scraper is running
      // 2: database professor clearing function has completed      
      adminPanelHTML: "Invalid Credentials"      
    }

    // define bart alert message constants
    Bert.defaults = {
      hideDelay: 8000, //time alert stays on screen
      type: 'danger',
      style: 'growl-top-right',
      icon: 'fa-warning',
    };

    this.approveReview.bind(this);
    this.removeReview.bind(this);
    this.unReportReview.bind(this);
  }
  // 
  // componentWillMount(){
  //   if(Session.get("token") != undefined){
  //     Meteor.call('tokenIsAdmin', Session.get("token"), (error, result) => {
  //       if (!error && result === true) {
  //         setTimeout(function () {
  //                 console.log("here0");
  //         }, 3000);
  //             adminPanelHTML  = (
  // 
  //             )
  //             this.setState({adminPanelHTML: adminPanelHTML})
  //       }
  //     })
  //   }
  // }
    
  // Call when user asks to approve a review. Accesses the Reviews database
  // and changes the review with this id to visible.
  approveReview(review) {
    Meteor.call('makeVisible', review, Session.get("token"), (error, result) => {
      if (!error && result === 1) {
        console.log("Review approved")
      } else {
        console.log(error)
      }
    });
  }

  // Call when user asks to remove a review. Accesses the Reviews database
  // and deletes the review with this id.
  removeReview(review) {
    Meteor.call('removeReview', review, Session.get("token"), (error, result) => {
      if (!error && result === 1) {
        console.log("Review removed")
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
        console.log("Review unreported")
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
    this.setState({ disableNewSem: true, loadingSemester: 1 });
    Meteor.call('addNewSemester', initiate, (error, result) => {
      if (!error && result === 1) {
        console.log("Added new semester courses");
        this.setState({ disableNewSem: false, loadingSemester: 2 });
      } else {
        console.log("Error at Meteor Call: addNewSemester");
        console.log(error);
      }
    });
  }

  // Call when user selects "Initialize Database" button. Scrapes the Cornell
  // Course API to store all classes and subjects in the local database.
  // Then, runs code to store id's of cross-listed classes against each class.
  // Should only be run ONCE when the app is initialzied.
  //
  // NOTE: requries an initialize flag to ensure the function is only run on
  // a button click without this, it will run every time this component is created.
  addAllCourses(initiate) {
    console.log("adding all classes");
    this.setState({ disableInit: true, loadingInit: 1 });
    Meteor.call('addAll', initiate, (error, result) => {
      if (!error && result === 1) {
        console.log("Added new semester courses");
        this.setState({ disableInit: false, loadingInit: 2 });
      } else {
        console.log("Error at Meteor Call :addAll");
        console.log(error)
      }
    });
  }

  updateProfessors(initiate) {
    console.log("Updating professors");
    this.setState({ disableInit: true, loadingProfs: 1 });
    Meteor.call('setProfessors', initiate, (error, result) => {
      if (!error && result === 1) {
        console.log("Updated the professors");
        this.setState({ disableInit: false, loadingProfs: 2 });
      } else {
        console.log("Error at Meteor Call :setProfessors");
        console.log(error)
      }
    });
  }

  resetProfessors(initiate) {
    console.log("Setting the professors to an empty array");
    this.setState({ disableInit: true, resettingProfs: 1 });
    Meteor.call('resetProfessors', initiate, (error, result) => {
      if (!error && result === 1) {
        console.log("Reset all the professors to empty arrays");
        this.setState({ disableInit: false, resettingProfs: 2 });
      } else {
        console.log("Error at Meteor Call :resetProfessors");
        console.log(error)
      }
    });
  }

  // handle the first click to the "Initialize Database" button. Show an alert
  // and update state to remember the next click will be a double click.
  firstClickHandler() {
    Bert.alert('<div><h1>STOP AND THINK REALLY HARD</h1><p>This will delete all data in the database!!! Click agian ONLY if you are initializing the database.</p></div>');
    this.setState({ doubleClick: true });
  }

  // Render the "Initialize Database" button.
  // If this is the user's first click, make the button give an alert.
  // If this is the user's second click, call addAllCourses above to initiaize
  // the local database
  renderInitButton(doubleClick) {
    // offer button to edit database
    if (doubleClick) {
      return (
        <div className="btn-group separate-buttons" role="group">
          <button disabled={this.state.disableInit} type="button" className="btn btn-warning" onClick={() => this.addAllCourses(true)}>Initialize Database</button>
        </div>
      );
    } else {
      // offer button that gives alert and saves next click as a double click (in local state)
      return (
        <div className="btn-group separate-buttons" role="group">
          <button type="button" className="btn btn-warning" onClick={() => this.firstClickHandler()}>Initialize Database</button>
        </div>
      );
    }
  }

  // Show a list of all reviews that have not been approved. Will allow admin to
  // approve or delete with the click of button.
  renderUnapprovedReviews() {
    remFunc = this.removeReview;
    appFunc = this.approveReview;
    return this.props.reviewsToApprove.map(function (review) {
      if (review.reported !== 1) {
        return <UpdateReview key={review._id} info={review} removeHandler={remFunc} approveHandler={appFunc} />;
      }
    });
  }

  // Show a list of all reviews that were reported. Will allow admin to approve
  // or delete with the click of button.
  renderReportedReviews() {
    remFunc = this.removeReview;
    appFunc = this.approveReview;
    unRepFunc = this.unReportReview;
    return this.props.reviewsToApprove.map(function (review) {
      //create a new class "button" that will set the selected class to this class when it is clicked.
      if (review.reported === 1) {
        return <UpdateReview key={review._id} info={review} removeHandler={remFunc} approveHandler={appFunc} unReportHandler={unRepFunc} />
      }
    });
  }

  render() {
    return (
      <div className="container whiteBg">
        <div className="width-90">
          <div className="container whiteBg">
            <div className="width-90">
              <h2>Admin Interface</h2>
        
              <br />
        
              <div className="text-right">
                <div className="btn-group separate-buttons" role="group">
                  <button disabled={this.state.disableNewSem} type="button" className="btn btn-warning" onClick={() => this.addNewSem(true)}>Add New Semester</button>
                </div>
                <div className="btn-group separate-buttons" role="group">
                  <button type="button" className="btn btn-warning" onClick={() => this.updateProfessors(true)}>Update Professors</button>
                </div>
                <div className="btn-group separate-buttons" role="group">
                  <button type="button" className="btn btn-warning" onClick={() => this.resetProfessors(true)}>RESET Professors</button>
                </div>
                <div className="btn-group" role="group">
                  {this.renderInitButton(this.state.doubleClick)}
                </div>
              </div>
        
              <div hidden={!(this.state.loadingSemester === 1)} className="width-90">
                <p>Adding New Semester Data. This process can take up to 15 minutes.</p>
              </div>
        
              <div hidden={!(this.state.loadingSemester === 2)} className="width-90">
                <p>New Semester Data import is complete!</p>
              </div>
        
              <div hidden={!(this.state.resettingProfs === 1)} className="width-90">
                <p>Clearing all associated professors from Classes.</p>
                <p>This process can take up to 15 minutes.</p>
              </div>
        
              <div hidden={!(this.state.resettingProfs === 2)} className="width-90">
                <p>All professor arrays in Classes reset to empty!</p>
              </div>
        
              <div hidden={!(this.state.loadingProfs === 1)} className="width-90">
                <p>Updating professor data to Classes.</p>
                <p>This process can take up to 15 minutes.</p>
              </div>
        
              <div hidden={!(this.state.loadingProfs === 2)} className="width-90">
                <p>Professor data import to Classes is complete!</p>
              </div>
        
              <div hidden={!(this.state.loadingInit === 1)} className="width-90">
                <p>Database Initializing. This process can take up to 15 minutes.</p>
              </div>
        
              <div hidden={!(this.state.loadingInit === 2)} className="width-90">
                <p>Database initialaization is complete!</p>
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
        </div>
      </div>
    )

  };
}

// requires a list of reviews not visible to regular users
Admin.propTypes = {
  reviewsToApprove: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab reivews.
// The component will automatically re-render when new views are added to the database.
export default withTracker(props => {
  const subscription = Meteor.subscribe('reviews', "", 0, null, Session.get("token")); //get unapproved or reported reviews
  const loading = !subscription.ready();
  const reviewsToApprove = Reviews.find({}).fetch();
  return {
    reviewsToApprove,
  };
})(Admin);

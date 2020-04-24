import React, { Component } from 'react';
import { Meteor } from "meteor/meteor";
import CourseCard from './CourseCard.jsx';
import Form from './Form.jsx';
import Gauge from './Gauge.jsx';
import Navbar from './Navbar.jsx';
import CourseReviews from './CourseReviews.jsx';
import "./css/App.css";
import { courseVisited } from './js/Feedback.js';
import "./css/ClassView.css";
import PropTypes from "prop-types";
import { Classes } from '../api/dbDefs.js';
import { withTracker } from 'meteor/react-meteor-data';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import './css/Form.css';

/*
  ClassView component.

  View component accessed via the /course route. It renders course infomation for
  the class referenced in the URL GET parameters (provided in the props).

  Parses the GET variables and searches the Classes collection in the local database
  for the corresponding class object.
  If one is found, a CourseCard, Form and Recent Reviews are rendered for that class.
  Otherwise, the user receives an error page. A Loading animation is rendered while
  the app is searching for a match.

  The navigation bar is visible for all 3 of the above views, so the component
  must also support SearchBar functionality.
*/

export class ClassView extends Component {
  constructor(props) {
    super(props);

    // grabs class number and subject from the GET parameters
    const number = this.props.match.params.number;
    const subject = this.props.match.params.subject.toLowerCase();

    // local state stores the get variables and the class object they
    // correspond to, and flags to signal that a class was not found.
    // Saves current user input to the searchbar as a controlled component 'query'.
    this.state = {
      number: number,
      subject: subject,
      selectedClass: null,
      classDoesntExist: false,
      popUpVisible: false,
      popupPos: "hidden",
      popUpIsEnabled: false //Note: popup is currently disabled, should be refactored
                            // and tested before enabling
    };

    //Used to prevent endless reloading in componentDidUpdate
    this.firstLoad = true;

    this.togglePopupForm.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.decidePopup = this.decidePopup.bind(this);
    this.updateCurrentClass = this.updateCurrentClass.bind(this);
  }

  // Once the component loads, make a call to the backend for class object.
  // Update the local state accordingly.  Called from componentDidUpdate()
  updateCurrentClass(classNumber, classSubject){
    Meteor.call("getCourseByInfo", classNumber, classSubject, (err, selectedClass) => {
      if (!err && selectedClass) {
        // Save the Class object that matches the request
        this.setState({
          selectedClass: selectedClass
        });
      }
      else {
        // No class matches the request.
        console.log("No match");
        this.setState({
          classDoesntExist: true
        });
      }
    });
  }

  componentDidUpdate(prevProps){
    //if this component receives new props from the Redirect, it resets its state so that it can render/mount
    //a new ClassView component with the new props
    const number = this.props.match.params.number;
    const subject = this.props.match.params.subject.toLowerCase();

    if((prevProps.match.params.number !== number
        || prevProps.match.params.subject.toLowerCase() !== subject)
        || this.firstLoad){
      this.setState({
        number: number,
        subject: subject,
        selectedClass: null,
        classDoesntExist: false,
        popUpVisible: false,
        popupPos: "hidden",
      });
      this.firstLoad = false;
      this.updateCurrentClass(number, subject);
      if(this.state.popUpIsEnabled){
        this.decidePopup();
      }
    }
  }

  getPopUpCourseOptions() {
    if (this.props.allCourses != []) {
      const popUpCourseOptions = []
      for(const course in this.props.allCourses){
        const courseObj = this.props.allCourses[course]

        popUpCourseOptions.push({
          "value" : courseObj.classNum,
          "label" : courseObj.classTitle
        })
      }
      return popUpCourseOptions
    }
  }

  togglePopupForm(){
    const nextState = this.state.popupPos == "hidden" ? "open" : "hidden";
    this.setState({ popupPos: nextState });
  }

  showPopup() {
      this.setState({ popUpVisible: true });
  }

  hidePopup() {
    this.setState({ popUpVisible: false });
  }

  // Decides to show popup. Wait 30 seconds before user can see popup.
  // If user hasn't seen popup in over 4 hours, set up 30 second timer.
  // Checks every 5 seconds for this condition
  decidePopup(){
    if(Session.get("popup_timer") != undefined
        && Session.get("popup_timer") != ""
        && Session.get("seen_popup") != true
        && Math.abs(Session.get("popup_timer") - new Date().getTime()) > 30 * 1000 /*(30 seconds)*/
        && (!this.state.lastTyped
            || Math.abs(this.state.lastTyped- new Date().getTime()) > 10 * 1000 /*(10 seconds)*/)){
      this.showPopup();
      Session.setPersistent({"seen_popup": true});
    }
    else{
      if(Session.get("seen_popup") === true
        && Math.abs(Session.get("popup_timer") - new Date().getTime()) >  1000)/*(4 hours)*/{
          Session.setPersistent({"seen_popup": false});
          Session.setPersistent({"popup_timer": new Date().getTime()});
        }
      setTimeout(() => { this.decidePopup() }, 5000);
    }
  }

  // If a class was found, render a CourseCard, Form and Recent Reviews for the class.
  render() {
    if (this.state.selectedClass) {
      courseVisited(this.state.selectedClass.classSub, this.state.selectedClass.classNum);
      return (
        <div className="container-fluid container-top-gap-fix classViewContainer">
          <Navbar />
          <div className="clearfix" />
          <div className="container-width no-padding classview-column-container">
            <div className="col-md-5 col-sm-5 col-xs-5 sticky no-padding navbar-margin classview-coursecard-min-width">
              <CourseCard course={this.state.selectedClass} />
            </div>
            <div className="col navbar-margin classview-right-panel">
              <div className="row classview-gauge-container">
                <div className="col-md-4 col-sm-4 col-xs-4">
                  <Gauge width="14vw" height="10vh" rating={parseFloat(this.state.selectedClass.classRating)} text="Overall"/>
                </div>
                <div className="col-md-4 col-sm-4 col-xs-4">
                  <Gauge width="14vw" height="10vh" rating={parseFloat(this.state.selectedClass.classDifficulty)} text="Difficulty"/>
                </div>
                <div className="col-md-4 col-sm-4 col-xs-4">
                  <Gauge width="14vw" height="10vh" rating={parseFloat(this.state.selectedClass.classWorkload)} text="Workload"/>
                </div>
              </div>
              <div className="row no-padding classview-reviews-container">
                <CourseReviews  courseId={this.state.selectedClass._id} />
              </div>
            </div>
          </div>
          <Rodal animation="zoom" height={565} width={window.innerWidth/2} measure="px" className="modalForm" visible={this.state.popUpVisible} onClose={this.hidePopup.bind(this)}>
            <div className="popup-main animate-form popup-background">
              <div className={"popup-form animate-form popup-" + this.state.popupPos}>
                <p className="popup-text1" >Want to contribute your opinion?</p>
                <img src='/popup_background1.png' className="center-block scale-popup-img" alt="Students Chatting" />
                <button className="popup-button-center" onClick={this.togglePopupForm.bind(this)}>
                Leave a Review<i className="popup-arrow"></i>
                </button>
                <Form searchBar={true} inUse={this.state.popUpVisible} course={this.state.selectedClass} />
              </div>
            </div>

          </Rodal>
        </div>
      );
    } else if (this.state.classDoesntExist) {
      // Class was not found, so show a 404 error graphic.
      return (
        <div className="container-fluid container-top-gap-fix">
          <Navbar />
          <div className="class-error-container">
            <img id="errorgauge" src="/error.png" width="400px" height="auto" />
            <h2>{'Sorry, we couldn\'t find the class you\'re searching for.'}</h2>
            <h2>Please search for a different class.</h2>
          </div>
        </div>
      );
    } else {
      // While a class is being searched for, render a loading animation.
      const Loading = require('react-loading-animation');
      return (
        <div className="classview-loading">
          <Loading />;
              </div>
      )
    }
  }
}

// takes no props
ClassView.propTypes = {
  allCourses: PropTypes.array.isRequired,
  match: PropTypes.object
};

// wrap in a container class that allows the component to dynamically grab courses
// that contain this query anywhere in their full name. The component will automatically
//  re-render when new classes are added to the database.
export default withTracker(() => {
  const subscription = Meteor.subscribe('classes', "");
  const loading = !subscription.ready();
  const allCourses = Classes.find({}).fetch();
  return {
    allCourses, loading,
  };
}) (ClassView);

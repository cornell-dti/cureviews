import React, { Component } from 'react';
import { Meteor } from "meteor/meteor";
import CourseCard from './CourseCard.jsx';
import Form from './Form.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import "./css/App.css";
import { courseVisited } from './js/Feedback.js';
import "./css/ClassView.css";
import PropTypes from "prop-types";
import { Classes } from '../api/dbDefs.js';
import { withTracker } from 'meteor/react-meteor-data';
import Select from 'react-select';
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
      popupPos: "hidden"
    };

    this.togglePopupForm.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.decidePopup = this.decidePopup.bind(this);
    this.decidePopup();
    this.onFormChange= this.onFormChange.bind(this);
  }

  // Once the component loads, the constructor will have added the GET variables to the local state.
  // Use the get variables to search the local Classes database for a class with the
  // requested subject and course number. Update the local state accordingly.
  componentWillMount() {

    Meteor.call("getCourseByInfo", this.state.number, this.state.subject, (err, selectedClass) => {
      if (!err && selectedClass) {
        // Save the Class object that matches the request
        this.setState({
          selectedClass: selectedClass
        });
      }
      else {
        // No class matches the request.
        console.log("no");
        this.setState({
          classDoesntExist: true
        });
      }
    });

  }
  
  // Updates the last time user typed in the form textbox
  // Used so that the popup doesn't show while user is typing where
  onFormChange(e){
      this.setState({lastTyped:new Date().getTime()});
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
      setTimeout(() => { this.decidePopup() }, 5000);
    }
  }

  // If a class was found, render a CourseCard, Form and Recent Reviews for the class.
  render() {
    if (this.state.selectedClass) {
      courseVisited(this.state.selectedClass.classSub, this.state.selectedClass.classNum);
      return (
        <div className="container-fluid container-top-gap-fix">
          <div className="row navbar">
            <div className="col-md-2 col-sm-2 col-xs-2">
              <div className="cornell-reviews">              
                <a className="title-link" href="/">CU Reviews</a>
              </div>
            </div>
            <div className="col-md-7 col-sm-7 col-xs-7">
             <SearchBar query={this.state.popUpVisible ? "" : this.state.query} queryFunc={this.updateQuery} />
            </div>
            <div className="col-md-3 col-sm-3 col-xs-3 fix-padding">
              <a id='report-bug' href="https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank" rel="noopener noreferrer"> Report a Bug</a>
            </div>
          </div>
          <div className='clearfix' />
          <div className='container noPadding'>
            <div className="col-md-6 col-sm-12 col-xs-12 sticky">
              <CourseCard course={this.state.selectedClass} />
            </div>
            <div className="col-md-6 col-sm-12 col-xs-12 panel-container panel-color-gray">
              <div>
                <Form onChange={this.onFormChange} inUse={!this.state.popUpVisible} course={this.state.selectedClass} />
              </div>
              <div>
                <CourseReviews courseId={this.state.selectedClass._id} />
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
                <Form inUse={this.state.popUpVisible} searchBar={true} query={this.state.query} queryFunc={this.updateQuery} course={this.state.selectedClass} />
              </div>
            </div>
            
          </Rodal>
        </div>
      );
    } else if (this.state.classDoesntExist) {
      // Class was not found, so show a 404 error graphic.
      return (
        <div className="container-fluid container-top-gap-fix">
          <div className="row navbar">
            <div className="col-md-2 col-sm-2 col-xs-2">
              <a className="cornell-reviews title-link" href="/">
                <span>CU Reviews</span>
              </a>
            </div>
            <div className="col-md-7 col-sm-7 col-xs-7">
              <SearchBar query={this.state.query} queryFunc={this.updateQuery} />
            </div>
            <div className="col-md-3 col-sm-3 col-xs-3 fix-padding">
              <a id='report-bug' href="https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank" rel="noopener noreferrer"> Report a Bug</a>
            </div>
          </div>
          <div id="error">
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
        <div id="loading">
          <Loading />;
              </div>
      )
    }
  }
}

// takes no props
ClassView.propTypes = {
  match: PropTypes.object
};

// wrap in a container class that allows the component to dynamically grab courses
// that contain this query anywhere in their full name. The component will automatically
//  re-render when new classes are added to the database.
export default withTracker(props => {
  const subscription = Meteor.subscribe('classes', "");
  const loading = !subscription.ready();
  const allCourses = Classes.find({}).fetch();
  return {
    allCourses, loading,
  };
}) (ClassView);

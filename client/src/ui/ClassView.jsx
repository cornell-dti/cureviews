import React, { Component, useEffect, useState } from 'react';
import { Meteor } from "../meteor-shim";
import { Session } from "../meteor-session";
import CourseCard from './CourseCard';
import Form from './Form';
import Gauge from './Gauge';
import Navbar from './Navbar';
import CourseReviews from './CourseReviews';
import "./css/App.css";
import { courseVisited } from './js/Feedback';
import "./css/ClassView.css";
import PropTypes from "prop-types";
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
    const number = this.props.routeInfo.match.params.number;
    const subject = this.props.routeInfo.match.params.subject.toLowerCase();

    // local state stores the get variables and the class object they
    // correspond to, and flags to signal that a class was not found.
    // Saves current user input to the searchbar as a controlled component 'query'.
    this.state = {
      number: number,
      subject: subject,
      selectedClass: null,
      classDoesntExist: false
    };

    //Used to prevent endless reloading in componentDidUpdate
    this.firstLoad = true;

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
    const number = this.props.routeInfo.match.params.number;
    const subject = this.props.routeInfo.match.params.subject.toLowerCase();

    if((prevProps.routeInfo.match.params.number !== number
        || prevProps.routeInfo.match.params.subject.toLowerCase() !== subject)
        || this.firstLoad){
      this.setState({
        number: number,
        subject: subject,
        selectedClass: null,
        classDoesntExist: false
      });
      this.firstLoad = false;
      this.updateCurrentClass(number, subject);
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
        </div>
      );
    } else if (this.state.classDoesntExist) {
      // Class was not found, so show a 404 error graphic.
      return (
        <div className="container-fluid container-top-gap-fix">
          <Navbar />
          <div className="class-error-container">
            <img className="errorgauge" src="/error.svg" width="400px" height="auto" alt="error" />
            <h2 className="error-text">{'Sorry, we couldn\'t find the class you\'re searching for.'}</h2>
            <h2 className="error-text">Please search for a different class.</h2>
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
export default props => {
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    Meteor.subscribe("classes", "", (err, courses) => {
      setAllCourses(courses);
      setLoading(false);
    });
  }, []);

  return <ClassView routeInfo={props} allCourses={allCourses} loading={loading}></ClassView>;
};

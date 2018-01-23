import React, {Component, PropTypes} from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {Classes} from '../api/classes.js';
import Form from './Form.jsx';
import Course from './Course.jsx';
import CourseCard from './CourseCard.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import PopularClasses from './PopularClasses.jsx';
import "./css/App.css";
import {sendFeedback} from './js/Feedback.js';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    // state of the app will change depending on class selection and current search query
    this.state = {
      selectedClass: null,
      query: ""
    };

    // bind functions called in other files to this context, so that current state is still accessable
    this.handleSelectClass = this.handleSelectClass.bind(this);
    this.updateQuery = this.updateQuery.bind(this);
  }

  //get the full class details for the clicked class. Called in Course.jsx
  handleSelectClass(classId) {
    Meteor.call('getCourseById', classId, (error, result) => {
      if (!error) {
        this.setState({selectedClass: result, query: ""});
      } else {
        console.log(error)
      }
    });
  }

  //redirect to force login
  forceLogin() {
    window.location = "http://aqueous-river.herokuapp.com/saml/auth?persist=" + encodeURIComponent("http://localhost:3000/auth") +"&redirect=" + encodeURIComponent("http://localhost:3000/app");
  }

  //set the state variable to the current value of the input. Called in SearchBar.jsx
  updateQuery(event) {
    this.setState({query: event.target.value});
    //Session to be able to get info from this.state.query in createContainer
    Session.set('querySession', this.state.query);
  }

  //check if a class is selected, and show a coursecard only when one is.
  renderCourseCard() {
    //Removes the backgroundImage from the body tag after a course is selected
    document.body.style.backgroundImage = "url('')";
    var toShow = <div/>; //empty div
    if (this.state.selectedClass !== null) {
      toShow = <CourseCard course={this.state.selectedClass}/>;
    }
    return toShow;
  }

  //check if a class is selected, dispay an add review form only when one is
  renderForm() {
    var toShow = <div/>;
    if (this.state.selectedClass !== null) {
      toShow = <Form courseId={this.state.selectedClass._id}/>;
    }
    return toShow;
  }

  //check if a class is selected. Display past reviews for the class only when one is selected
  //Or display most recent reviews out of all classes if no class is selected
  renderPastReviews() {
    var toShow = <div/>;
    if (this.state.selectedClass !== null) {
      toShow = <CourseReviews courseId={this.state.selectedClass._id} handler={this.handleSelectClass}/>;
    } else {
      toShow = <CourseReviews courseId={"-1"} handler={this.handleSelectClass}/>;
    }
    return toShow;
  }

  //displays most reviewed classes
  renderPopularClasses() {
    var toShow = <div/>;
    toShow = <PopularClasses clickFunc={this.handleSelectClass}/>;
    return toShow;
  }

  render() {
    if (this.state.selectedClass === null) {
      return (
        <div className="container container-top-gap-fix">
          <div className='row'>
            <nav className="navbar">
              <h1 className="cornell-reviews title-link" id="navname"><a href="">CU Reviews</a></h1>
              <span className="navbar-text navbar-right" ><a id="report-bug" href = "https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank">Report a Bug</a></span>
            </nav>
          </div>
          <div className='row pushDown'>
            <div className="col-md-10 col-sm-12 col-xs-12 col-md-offset-1">
              <p id="welcome_text">Welcome to CU Reviews</p>
            </div>
          </div>
          <div className="row text-center pushDown">
            <SearchBar query={this.state.query} queryFunc={this.updateQuery} clickFunc={this.handleSelectClass}/>
          </div>
          <div className='row pushDown'>
            <div className="col-md-10 col-md-offset-1">
              <p id="second_welcome_text">Search for your courses, rate your classes, and share your feedback</p>
            </div>
          </div>
          <div className='row panel-color-translucent'>
            <div className="col-md-6 col-sm-12 col-xs-12 panel-container panel sticky">
              {this.renderPopularClasses()}
            </div>
            <div className="col-md-6 col-sm-12 col-xs-12 panel-container fix-contain">
              <div>
                {this.renderPastReviews()}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container remove-background">
          <div className='row'>
            <nav className="navbar navbar-flex navbar-fixed-top col-xs-12">
              <h1 className="navbar-brand mb-0 title-link" id= "navname"><a href="">CU Reviews</a></h1>
              <SearchBar query={this.state.query} queryFunc={this.updateQuery} clickFunc={this.handleSelectClass}/>
              <div className="navbar-text navbar-right">
                <span><a id="report-bug" href = "https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank">Report a Bug</a></span>
              </div>
            </nav>
          </div>
          <div className='row'>
            <div className="col-md-6 col-sm-12 col-xs-12 sticky">
              {this.renderCourseCard()}
            </div>
            <div className="col-md-6 col-sm-12 col-xs-12 panel-container panel-color-gray fix-contain">
              <div>
                {this.renderForm()}
              </div>
              <div className="useful useful-text">
                <h5>
                  Was this helpful? <a onClick={() => sendFeedback(1)}><span id="yes">yes</span></a> | <a onClick={() => sendFeedback(0)}><span><a href = "https://goo.gl/forms/q93rYWY7567vLnAQ2" target="_blank" id="no">no</a></span></a>
                </h5>
                </div>
              <div>
                {this.renderPastReviews()}
              </div>
            </div>
          </div>
        </div>
      );
      courseVisited(this.state.selectedClass.classSub, this.selectedClass.classNum);
    }
  }
}

App.propTypes = {};

export default createContainer((props) => {return {};}, App);

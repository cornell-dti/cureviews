import React, {Component, PropTypes} from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import Form from './Form.jsx';
import CourseCard from './CourseCard.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import PopularClasses from './PopularClasses.jsx';
import "./css/App.css";
import {sendFeedback} from './js/Feedback.js';
import {courseVisited} from './js/Feedback.js';
import { Classes } from '../api/classes.js';

// Home component - represents the homepage
class Home extends Component {
  constructor(props) {
    super(props);

    // hold query to send to searchbar
    this.state = {
      query: "",
    };

    // bind functions called in other files to this context, so that current state is still accessable
    this.updateQuery.bind(this);
  }

  //set the state variable to the current value of the input. Called in SearchBar.jsx
  //searchbar must receive the query to use in subscription to courses for search suggestions
  updateQuery = (event) => {
    this.setState({query: event.target.value});
    //Session to be able to get info from this.state.query in createContainer
    Session.set('querySession', this.state.query);
  }

  //redirect to force login
  forceLogin() {
    window.location = "http://aqueous-river.herokuapp.com/saml/auth?persist=" + encodeURIComponent("http://localhost:3000/auth") +"&redirect=" + encodeURIComponent("http://localhost:3000/app");
  }

  render() {
    return (
      <div className="container container-top-gap-fix">
        <div className='row'>
          <nav className="navbar">
            <h1 className="cornell-reviews title-link" id="navname"><a href="/">CU Reviews</a></h1>
            <span className="navbar-text navbar-right" ><a id="report-bug" href = "https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank">Report a Bug</a></span>
          </nav>
        </div>
        <div className='row pushDown'>
          <div className="col-md-10 col-sm-12 col-xs-12 col-md-offset-1">
            <p id="welcome_text">Welcome to CU Reviews</p>
          </div>
        </div>
        <div className="row text-center pushDown">
          <SearchBar query={this.state.query} queryFunc={this.updateQuery} />
        </div>
        <div className='row pushDown'>
          <div className="col-md-10 col-md-offset-1">
            <p id="second_welcome_text">Search for your courses, rate your classes, and share your feedback</p>
          </div>
        </div>
        <div className='row panel-color-translucent'>
          <div className="col-md-6 col-sm-12 col-xs-12 panel-container panel sticky">
            <PopularClasses />
          </div>
          <div className="col-md-6 col-sm-12 col-xs-12 panel-container fix-contain">
            <div>
              <CourseReviews courseId={"-1"} /> 
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  allCourses: PropTypes.array.isRequired,
};

export default createContainer((props) => {
  const subscription = Meteor.subscribe('classes', props.query);
  const loading = !subscription.ready();
  const allCourses = Classes.find({}).fetch();
  return {
    allCourses, loading,
  };
}, Home);

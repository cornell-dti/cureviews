import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Form from './Form.jsx';
import CourseCard from './CourseCard.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import SubjectLeaderboard from './SubjectLeaderboard.jsx';
import "./css/App.css";
import {sendFeedback} from './js/Feedback.js';
import {courseVisited} from './js/Feedback.js';
import { Classes } from '../api/dbDefs.js';

/*
  App Component. Uppermost View component in the component tree,
  the first element of the HTML body tag grabbed by main.html.

  Renders the applicaiton homepage with a navbar and searchbar, popular
  classes and recent reviews components.
*/
export default class App extends Component {
  constructor(props) {
    super(props);

    // keep track of user's inputed query to send to SearcBar. Initialize to empty string.
    this.state = {
      query: "",
    };

    // Bind function queryUpdate to this component's state. Required because updateQuery
    // changes the App component's state, but is called in another file (SearchBar component)
    // the 'this' keyword changes depending on the context of the file a function is called in,
    // so we bind this function to the App component to refence it as 'this'
    this.updateQuery.bind(this);
  }

  // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  updateQuery = (event) => {
    this.setState({query: event.target.value});
    //Session to be able to get info from this.state.query in withTracker
    Session.set('querySession', this.state.query);
  }

  // TODO: Redirect the user to a login screen. Once the user logs in, successfully,
  // they will be re-routed to this component.
  // forceLogin() {
  //   window.location = "http://aqueous-river.herokuapp.com/saml/auth?persist=" + encodeURIComponent("http://localhost:3000/auth") +"&redirect=" + encodeURIComponent("http://localhost:3000/app");
  // }

  render() {
    return (
      <div className="container-fluid container-top-gap-fix background-image">
        <nav className="navbar">
          <div className="navbar-header">
            <a className="cornell-reviews title-link navbar-brand" id="navname" href="/">
              <span><img src='logo.svg' width="40" height="40" className="d-inline-block align-top" id='logoImg' alt="" /> CU Reviews</span>
            </a>
          </div>
          <ul className="nav navbar-nav nav-right nopadding clearBackground">
            <li className='reportButton'><a id='report-bug' href="https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank"> Report a Bug</a></li>
          </ul>
        </nav>
        <div className='container pushDown'>
          <div className="col-md-10 col-sm-12 col-xs-12 col-md-offset-1">
            <p id="welcome_text">Welcome to CU Reviews</p>
          </div>
        </div>
        <div className="container text-center pushDown searchWidth">
          <SearchBar query={this.state.query} queryFunc={this.updateQuery} />
        </div>
        <div className='container pushDown'>
          <div className="col-md-10 col-md-offset-1">
            <p id="second_welcome_text">Search for your courses, rate your classes, and share your feedback</p>
          </div>
        </div>
        <div className='container noPadding panel-color-translucent'>
          <div className="col-md-6 col-sm-12 col-xs-12 panel-container panel">
            <SubjectLeaderboard />
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

// takes no props
App.propTypes = {};

import React, { Component, PropTypes } from 'react';
import { Meteor } from "meteor/meteor";
import CourseCard from './CourseCard.jsx';
import Form from './Form.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import PopularClasses from './PopularClasses.jsx';
import "./css/App.css";
import {sendFeedback} from './js/Feedback.js';
import {courseVisited} from './js/Feedback.js';
import App from './App.jsx';
import "./css/ClassView.css";

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

export default class ClassView extends Component {
    constructor (props) {
        super(props);

        // grabs class number and subject from the GET parameters
        const number  = this.props.match.params.number;
        const subject = this.props.match.params.subject.toLowerCase();

        // local state stores the get variables and the class object they
        // correspond to, and flags to signal that a class was not found.
        // Saves current user input to the searchbar as a controlled component 'query'.
        this.state = {
            number: number,
            subject: subject,
            selectedClass: null,
            classDoesntExist: false,
            query: '',
        };

        this.updateQuery = this.updateQuery.bind(this);
    }

    // TODO: Redirect the user when they click the sign-in button. This will take the user
    // to a google login, and back to the homepage.
    // forceLogin() {
    //   window.location = "http://aqueous-river.herokuapp.com/saml/auth?persist=" + encodeURIComponent("http://localhost:3000/auth") +"&redirect=" + encodeURIComponent("http://localhost:3000/app");
    // }

    // Set the state variable to the current value of the input. Called within SearchBar.jsx, so
    // it must be bound to this component (in the constructor) so that this component's local state changes.
    // Searchbar takes the query in this component's local state to render its search suggestions.
    updateQuery(event) {
      this.setState({query: event.target.value});
      //Session to be able to get info from this.state.query in withTracker
      Session.set('querySession', this.state.query);
    }

    // Once the component loads, the constructor will have added the GET variables to the local state.
    // Use the get variables to search the local Classes database for a class with the
    // requested subject and course number. Update the local state accordingly.
    componentWillMount () {
      Meteor.call("getCourseByInfo", this.state.number, this.state.subject, (err, selectedClass) => {
          console.log("requesting", selectedClass);
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

    // If a class was found, render a CourseCard, Form and Recent Reviews for the class.
    render () {
        if (this.state.selectedClass) {
          courseVisited(this.state.selectedClass.classSub, this.state.selectedClass.classNum);
          return (
            <div className="container-fluid container-top-gap-fix remove-background">
              <nav className="navbar navbar-fixed-top">
                <div className="navbar-header">
                  <a className="cornell-reviews title-link navbar-brand" id="navname" href="/">
                    <span><img src='/logo.svg' width="40" height="40" className="d-inline-block align-top" id='logoImg' alt="" /> CU Reviews</span>
                  </a>
                </div>
                <ul className="nav navbar-nav nav-right searchWidth nopadding clearBackground">
                  <li className='nav-searchBar'><SearchBar query={this.state.query} queryFunc={this.updateQuery}/></li>
                  <li className="text-right reportButton reportButtonWidth"><a id='report-bug' href="https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank"> Report a Bug</a></li>
                </ul>
              </nav>
              <div className='clearfix' />
              <div className='container noPadding'>
                <div className="col-md-6 col-sm-12 col-xs-12 sticky">
                  <CourseCard course={this.state.selectedClass}/>
                </div>
                <div className="col-md-6 col-sm-12 col-xs-12 panel-container moveDown panel-color-gray">
                  <div>
                    <Form courseId={this.state.selectedClass._id}/>
                  </div>
                  <div className="useful useful-text">
                    <h5>
                      Was this helpful? <a onClick={() => sendFeedback(1)}><span id="yes">yes</span></a> | <a onClick={() => sendFeedback(0)}><span><a href = "https://goo.gl/forms/q93rYWY7567vLnAQ2" target="_blank" id="no">no</a></span></a>
                    </h5>
                    </div>
                  <div>
                    <CourseReviews courseId={this.state.selectedClass._id} />
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (this.state.classDoesntExist) {
          // Class was not found, so show a 404 error graphic.
          return (
              <div className="container-fluid container-top-gap-fix remove-background">
              <nav className="navbar navbar-fixed-top">
                <div className="navbar-header">
                  <a className="cornell-reviews title-link navbar-brand" id="navname" href="/">
                    <span><img src='/logo.svg' width="40" height="40" className="d-inline-block align-top" id='logoImg' alt="" /> CU Reviews</span>
                  </a>
                </div>
                <ul className="nav navbar-nav nav-right searchWidth nopadding clearBackground">
                  <li className='nav-searchBar'><SearchBar query={this.state.query} queryFunc={this.updateQuery}/></li>
                  <li className="text-right reportButton reportButtonWidth"><a id='report-bug' href="https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank"> Report a Bug</a></li>
                </ul>
              </nav>
              <div id="error">
                <img id="errorgauge" src="/error.png" width="400px" height="auto" />
                <h2>Sorry, we couldn't find the class you're searching for.</h2>
                <h2>Please search for a different class.</h2>
              </div>
              </div>

          );
        } else {
          // While a class is being searched for, render a loading animation.
            const Loading = require('react-loading-animation');
            return (
                <div id="loading">
                <Loading/>;
              </div>
            )
        }
    }
}

// takes no props
ClassView.propTypes = {};

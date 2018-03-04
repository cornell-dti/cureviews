import React, { Component, PropTypes } from 'react';
import { Meteor } from "meteor/meteor";
import CourseCard from './CourseCard.jsx';
import {createContainer} from 'meteor/react-meteor-data';
import Form from './Form.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import PopularClasses from './PopularClasses.jsx';
import "./css/App.css";
import {sendFeedback} from './js/Feedback.js';
import {courseVisited} from './js/Feedback.js';
import App from './App.jsx';
import "./css/Permalink.css";

// Permalink component - Component to render a CourseCard after searching for it in the database
export default class Permalink extends Component {
    constructor (props) {
        super(props);
        const number  = this.props.match.params.number;
        const subject = this.props.match.params.subject.toLowerCase();

        this.state = {
            number: number,
            subject: subject,
            selectedClass: null,
            classDoesntExist: false,
            query: '',
        };
        this.updateQuery = this.updateQuery.bind(this);
    }

    //redirect to force login
    forceLogin() {
      window.location = "http://aqueous-river.herokuapp.com/saml/auth?persist=" + encodeURIComponent("http://localhost:3000/auth") +"&redirect=" + encodeURIComponent("http://localhost:3000/app");
    }

    //set the state variable to the current value of the input. Called in SearchBar.jsx
    //searchbar must receive the query to use in subscription to courses for search suggestions
    updateQuery(event) {
      this.setState({query: event.target.value});
      //Session to be able to get info from this.state.query in createContainer
      Session.set('querySession', this.state.query);
    }

    componentWillMount () {
      Meteor.call("getCourseByInfo", this.state.number, this.state.subject, (err, selectedClass) => {
          console.log("requesting", selectedClass);
          if (!err && selectedClass) {
              console.log(selectedClass);
              this.setState({
                  selectedClass: selectedClass
              });
          }
          else {
              // 404
              console.log("no");
              this.setState({
                  classDoesntExist: true
              });
          }
      });
    }



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
            // return (
            //     <App selectedClass={ this.state.selectedClass } />
            // );
        } else if (this.state.classDoesntExist) {
          //TODO: 404 error graphic
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
                <img src="/error.png" width="400" height="300" />
                <h2>Sorry, we couldn't find your class you're searching for.</h2>
                <h2>Please search for a different class.</h2>
              </div>
              </div>

          );
        } else {
          //TODO: loading screen graphic
            const Loading = require('react-loading-animation');
            return (
                <div id="loading">
                <Loading/>;
              </div>
            )


        }
    }
}

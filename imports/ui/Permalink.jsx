import React, { Component, PropTypes } from 'react';
import { Meteor } from "meteor/meteor";
import App from './App.jsx';
import CourseCard from './CourseCard.jsx';
import {createContainer} from 'meteor/react-meteor-data';
import Form from './Form.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import PopularClasses from './PopularClasses.jsx';
import "./css/App.css";
import {sendFeedback} from './js/Feedback.js';
import {courseVisited} from './js/Feedback.js';
import Home from './Home.jsx';

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
      console.log("just to push new dev");
      window.location = "http://aqueous-river.herokuapp.com/saml/auth?persist=" + encodeURIComponent("http://localhost:3000/auth") +"&redirect=" + encodeURIComponent("http://localhost:3000/app");
    }

    //set the state variable to the current value of the input. Called in SearchBar.jsx
    //searchbar must receive the query to use in subscription to courses for search suggestions
    updateQuery(event) {
      this.setState({query: event.target.value});
      //Session to be able to get info from this.state.query in createContainer
      console.log("update to", this.state.query);
      Session.set('querySession', this.state.query);
    }

    componentWillMount () {
      console.log("trying to get class");
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
            <div className="container remove-background">
              <div className='row'>
                <nav className="navbar navbar-flex navbar-fixed-top col-xs-12">
                  <h1 className="navbar-brand mb-0 title-link" id= "navname"><a href="/">CU Reviews</a></h1>
                  <SearchBar query={this.state.query} queryFunc={this.updateQuery}/>
                  <div className="navbar-text navbar-right">
                    <span><a id="report-bug" href = "https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank">Report a Bug</a></span>
                  </div>
                </nav>
              </div>
              <div className='row'>
                <div className="col-md-6 col-sm-12 col-xs-12 sticky">
                  <CourseCard course={this.state.selectedClass}/>
                </div>
                <div className="col-md-6 col-sm-12 col-xs-12 panel-container panel-color-gray fix-contain">
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
              <div id="coursedetails">
                404: Class not found
              </div>
          );
        } else {
          //TODO: loading screen graphic
          return (
              <div id="coursedetails">
                Loading...
              </div>
          );
        }
    }
}

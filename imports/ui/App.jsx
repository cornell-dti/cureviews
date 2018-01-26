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
import Home from './Home.jsx';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    // state of the app will change depending on class selection, query sends info to searchbar
    this.state = {
      selectedClass: typeof this.props.selectedClass !== "undefined" && this.props.selectedClass !== null
          ? this.props.selectedClass
          : null,
      query: '',
    };

    // bind functions called in other files to this context, so that current state is still accessable
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

  render() {
    if (this.state.selectedClass === null) {
      <Home />
    } else {
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
      courseVisited(this.state.selectedClass.classSub, this.state.selectedClass.classNum);
    }
  }
}

App.propTypes = {};

export default createContainer((props) => {return {};}, App);

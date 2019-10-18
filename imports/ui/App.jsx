import React, { Component } from 'react';
import SearchBar from './SearchBar.jsx';
import "./css/App.css";
import { sendFeedback } from './js/Feedback.js';
import { courseVisited } from './js/Feedback.js';
import { Classes, Users } from '../api/dbDefs.js';
import { Results } from './Results.jsx'




/*
  App Component. Uppermost View component in the component tree,
  the first element of the HTML body tag grabbed by main.html.

  Renders the application homepage with a navbar and searchbar, popular
  classes and recent reviews components.
*/
export default class App extends Component {
  constructor(props) {
    super(props);

    // keep track of user's inputed query to send to SearcBar. Initialize to empty string.
    this.state = {
      query: "",
      search: 1,
    };

    // Bind function queryUpdate to this component's state. Required because updateQuery
    // changes the App component's state, but is called in another file (SearchBar component)
    // the 'this' keyword changes depending on the context of the file a function is called in,
    // so we bind this function to the App component to refence it as 'this'
    this.updateQuery.bind(this);
    document.getElementById('googleButton');
  }

  // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  updateQuery = (event) => {
    // trim the query to remove trailing spaces
    this.setState({ query: event.target.value.trim() });
    //Session to be able to get info from this.state.query in withTracker
    Session.set('querySession', this.state.query);
  }

  render() {
    if (this.state.search == 1) {
      return (
        <div>
          <Results filterResults={[{
            _id: "abc",  // mongo-generated random id for this document
            classSub: "abc", // subject, like "PHIL" or "CS"
            classNum: 3, // course number, like 1110
            classTitle: "abc", // class title, like 'Introduction to Algorithms'
            classPrereq: ["abc"], // list of pre-req classes, a string of Classes _id.
            crossList: ["abc"], // list of classes that are crosslisted with this one, a string of Classes _id.
            classFull: "abc", // full class title to search by, formated as 'classSub classNum: classTitle'
            classSems: ["abc"], // list of semesters this class was offered, like ['FA17', 'FA16']
            classProfessors: ["abc"], //list of professors that have taught the course over past semesters
            classRating: 3, // the average class rating from reviews
            classRatingColor: "gold", //color to indicate rating level
            classWorkload: 3, // the average workload rating from reviews
            classWorkloadColor: "gold", //color to indicate workload level
            classDifficulty: 3, // the average difficulty rating from reviews
            classDifficultyColor: "gold", //color to indicate difficulty level
            classGrade: "abc" // the average grade from reviews

          }]} />
        </div>
      );
    }
    return (
      <div className="container-fluid full-height background-gradient">

        <div className="row">
          <img src='/logo.png' className="img-responsive center-block scale-logo" id="img-padding-top" alt="CU Reviews Logo" />
        </div>
        <div className="row">
          <div className="col-md-9 col-sm-9 col-xs-9 center-block no-float z-index">
            <SearchBar query={this.state.query} queryFunc={this.updateQuery} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-10 col-md-offset-1">
            <p id="second_welcome_text">Search for your courses, rate your classes, and share your feedback</p>
          </div>
        </div>
        <div className="row footer navbar-fixed-bottom">
          <div className="col-md-12 col-sm-12 col-xs-12 noLeftRightPadding">
            <img src='/skyline.svg' className="center-block outline" id="" alt="" />
          </div>
        </div>
      </div>
    );
  }
}

// takes no props
App.propTypes = {};

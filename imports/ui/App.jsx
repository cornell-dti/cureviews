import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Form from './Form.jsx';
import CourseCard from './CourseCard.jsx';
import SearchBar from './SearchBar.jsx';
import CourseReviews from './CourseReviews.jsx';
import SubjectLeaderboard from './SubjectLeaderboard.jsx';
import "./css/App.css";
import { sendFeedback } from './js/Feedback.js';
import { courseVisited } from './js/Feedback.js';
import { Classes, Users } from '../api/dbDefs.js';
import { GoogleLogin } from 'react-google-login';




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
    };

    // Bind function queryUpdate to this component's state. Required because updateQuery
    // changes the App component's state, but is called in another file (SearchBar component)
    // the 'this' keyword changes depending on the context of the file a function is called in,
    // so we bind this function to the App component to refence it as 'this'
    this.updateQuery.bind(this);
    document.getElementById('googleButton');
  }

  responseGoogle = (response) => {
    console.log(response);
    user = response.profileObj.email.replace("@cornell.edu", '');
    token = response.tokenId;
    this.saveUserToken(user, token);

    this.retrieveUser(response);
    // Meteor.call('saveUserToken', user, token, (error, result) => {
    //   if (!error && result === 1) {
    //     console.log("Saved user and token to Session");
    //   } else {
    //     console.log("Error at Meteor Call : saveUserToken");
    //     console.log(error)
    //   }
    // });
  }

  //Checks database for user with given netId. If user does not exits,
  //creates new user and inserts into database.
  retrieveUser = (response) =>{
    console.log(response);

  //Get netID from response and look for in database
  var profile=response.profileObj;
  var netId=profile.email.split("@")[0];
  var currentUser;
  Meteor.call('getUserByNetId', netId, (error, result) =>{
    if(!error || result===1){
      currentUser=result;

      if(typeof currentUser==="undefined" || typeof currentUser==="null"){
        //Create new user from profile of response
        var newUser={
          firstName: profile.givenName,
          lastName: profile.familyName,
          netId: netId,
          affiliation: null,
          token: response.tokenId,
          privilege: "regular"
        }
        Meteor.call('insertUser', newUser, (error, result) =>{
          if(!error || result===1){
            currentUser=newUser;

            Meteor.call('getUserByNetId', netId, (error, result) =>{
              if(!error || result===1){
                currentUser=result;
                console.log(currentUser);
                return currentUser;
              }
              else{
                console.log(error);
              }
            }
            );
          }
          else{
            console.log(error);
          }
        }
        );
    
      }
      console.log(currentUser);
      return currentUser;
    }
    else{
      console.log(error);
    }
  }
  );
  }

  // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  updateQuery = (event) => {
    // trim the query to remove trailing spaces
    this.setState({ query: event.target.value.trim() });
    //Session to be able to get info from this.state.query in withTracker
    Session.set('querySession', this.state.query);
  }


  // TODO: Redirect the user to a login screen. Once the user logs in, successfully,
  // they will be re-routed to this component.
  // forceLogin() {
  //   window.location = "http://aqueous-river.herokuapp.com/saml/auth?persist=" + encodeURIComponent("http://localhost:3000/auth") +"&redirect=" + encodeURIComponent("http://localhost:3000/app");
  // }

  //Using meteor session to save the netID and token
  //Saves user's netID and token from response to Session
  saveUserToken(netId, token) {
    var regex = new RegExp(/^[a-zA-Z0-9]*$/i);
    if (regex.test(netId)) {
      // console.log("saving to Session");
      if (Session.equals(user, undefined) && Session.equals(user, undefined)) {
        Session.setDefaultPersistent(user, netId);
        Session.setDefaultPersistent(token, token);
      } else {
        Session.setPersistent({ user: netId, token: token });
      }
      // console.log(Session.get("user"));
      return 1;
    }
    else {
      // console.log("error with regex");
      return 0;
    };
  }

  render() {
    return (
      <div className="container-fluid full-height background-gradient">

        <GoogleLogin
          clientId="836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com"
          render={renderProps => (
            <button onClick={renderProps.onClick}>This is my custom Google button</button>
          )}
          buttonText="Login"
          onSuccess={this.responseGoogle.bind(this)}
          onFailure={this.responseGoogle.bind(this)}
        />

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

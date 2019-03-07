import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import {withTracker} from 'meteor/react-meteor-data';
import { GoogleLogin } from 'react-google-login';

/*
  Google Login C Component. Specific to this project.

  Start all components with this description format:

  Container component for the Google log in button so that it can be easily placed
  anywhere on the site.  Includes unecessary saving to DB and setting session methods

*/

export default class CUreviewsGoogleLogin extends Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   somevar1: 1
    //   somevar2: 2
    // }

    // this.func1.bind(this)
  }

  // // some function used in the app
  // func1(value) {
  // 
  // }
  // 
  // // another function used in the app. If these get to long, move to a new
  // // file under the /js folder named Template.js.
  // func2(value) {
  // 
  // }

  responseGoogle = (response) => {
    console.log(response);
    user = response.profileObj.email.replace("@cornell.edu", '');
    token = response.tokenId;
    this.saveUserToken(user, token);

    this.retrieveUser(response);
  }

  //Checks database for user with given netId. If user does not exits,
  //creates new user from [response], inserts into database, and returns the new user.
  retrieveUser = (response) =>{
    //Get netID from response and look for in database
    var profile=response.profileObj;
    var netId=profile.email.split("@")[0];
    var currentUser;
    Meteor.call('getUserByNetId', netId, (error, result) =>{
      if(!error || result===1){
        currentUser=result;

        // Create new user from profile of response if user does not exist yet
        if(typeof currentUser==="undefined" || typeof currentUser==="null"){
          var newUser={
            firstName: profile.givenName,
            lastName: profile.familyName,
            netId: netId,
            affiliation: null,
            token: response.tokenId,
            privilege: "regular"
          }
          //Insert the new user into the the database
          Meteor.call('insertUser', newUser, (error, result) =>{
            if(!error || result===1){
              currentUser=newUser;

              //Gets the new user from the database. This is done so that
              //the Mongo generated _id is included in the object
              Meteor.call('getUserByNetId', netId, (error, result) =>{
                if(!error || result===1){
                  currentUser=result;
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
        return currentUser;
      }
      else{
        console.log(error);
      }
    }
    );
  }
  
  //Using meteor session to save the netID and token
  //Saves user's netID and token from response to Session
  saveUserToken(netId, token) {
    console.log("Saving token")
    console.log(netId)
    var regex = new RegExp(/^[a-zA-Z0-9]*$/i);
    if (regex.test(netId)) {
      // console.log("saving to Session");
      if (Session.equals(user, undefined) && Session.equals(user, undefined)) {
        Session.setDefaultPersistent(user, netId);
        Session.setDefaultPersistent(token, token);
      } else {
        Session.setPersistent({ "user": netId, "token": token });
      }
      console.log(Session.get("user"));
      return 1;
    }
    else {
      console.log("error with regex");
      return 0;
    };
  }
  
  // // function that specifically renders HTML or another component. Keep these
  // // at the bottom of the list of functions, closer to the final render
  // renderElement() {
  // 
  // }
  
  render() {
    return (
      <div>
        <br/>
        <GoogleLogin
          clientId="836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com"
          render={renderProps => (
            <button onClick={renderProps.onClick}>Authenticate with @cornell.edu email</button>
          )}
          buttonText="Login"
          onSuccess={this.responseGoogle.bind(this)}
          onFailure={this.responseGoogle.bind(this)}
        />
      </div>
    );
  }
}

// Define the names, types and optional status of the props that will be passed
// to this component from the parent component that creates it.
// Be sure to include any collections obtained from withTracker!

// describe props
CUreviewsGoogleLogin.propTypes = {};
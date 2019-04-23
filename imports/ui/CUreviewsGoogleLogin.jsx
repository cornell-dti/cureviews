import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import {withTracker} from 'meteor/react-meteor-data';
import { GoogleLogin } from 'react-google-login';
import { Session } from 'meteor/session';

/*
  Google Login C Component. Specific to this project.

  Start all components with this description format:

  Container component for the Google log in button so that it can be easily placed
  anywhere on the site.  Includes unecessary saving to DB and setting session methods

*/

export default class CUreviewsGoogleLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastVerification: (new Date().getTime()) - 5000
    }

    this.responseGoogle.bind(this)
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
    token = response.tokenId;
    if (token){
      if (this.saveToken(token) === 1){
        console.log("Succesfully saved token to session");
      } else{
        console.log("Error saving token");
      }
      this.setState({lastVerification : new Date().getTime()});
      this.props.onSuccessFunction();
    }
    
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
  saveToken(token) {
    // console.log("This is the token in saveToken");
    // console.log(token);
    Session.setPersistent({"token": token});
    if (Session.get("token") != token){
      console.log("Error saving token to session")
      return 0;
    }
    // console.log("This is the session after saving token");
    // console.log(Session);
    return 1;
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
          hostedDomain="cornell.edu"
          render={renderProps => (
            <script>{(this.props.executeLogin 
                      && Math.abs(this.state.lastVerification - new Date().getTime()) >  5000) ? 
              setTimeout(function () {
                renderProps.onClick()
              }, this.props.waitTime)
               : 1 }</script>
          )}
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
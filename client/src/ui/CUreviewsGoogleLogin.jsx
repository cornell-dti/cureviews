import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import {withTracker} from 'meteor/react-meteor-data';
import { GoogleLogin } from 'react-google-login';
import { Session } from '../meteor-session';

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

    this.responseGoogle.bind(this);
    this.saveRedirectToSession.bind(this);
    this.getRedirectURI.bind(this);

    //Save redirect page
    //Will be either "admin" or "course"
    this.saveRedirectToSession(this.props.redirectFrom);
  }

  //Using meteor session to save the redirct page to Session
  saveRedirectToSession(from) {
    Session.setPersistent({"redirectFrom": from});
    if (Session.get("redirectFrom") !== from){
      console.log("Error saving redirectFrom to session");
      return 0;
    }
    return 1;
  }

  //This callback function is only called when Google Log-In uses a pop-up.  We now use a redirect
  // instead.  Therefore this callback is never used/called but I'll leave here for furture reference.
  // Previously called by adding: onSuccess={this.responseGoogle.bind(this)}
  // as a prop passed into <GoogleLogin> component below.
  responseGoogle = (response) => {
    const token = response.tokenId;
    console.log(token);
    if (token){
      if (this.saveToken(token) === 1){
        console.log(Session.get("token"));
        // console.log("Succesfully saved token to session");
      } else{
        console.log("Error saving token");
      }
      this.setState({lastVerification : new Date().getTime()});
      this.props.onSuccessFunction(response);
    }
    else{
      this.props.onFailureFunction(response);
    }
  }

  getRedirectURI(){
    if(window.location.host.includes("localhost")){
      return "http://" + window.location.host + "/auth/"
    }
      return "https://" + window.location.host + "/auth/"
  }

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
          uxMode="redirect"
          redirectUri={this.getRedirectURI()}
        />
      </div>
    );
  }
}

// Define the names, types and optional status of the props that will be passed
// to this component from the parent component that creates it.
// Be sure to include any collections obtained from withTracker!

// describe props
CUreviewsGoogleLogin.propTypes = {
  executeLogin:PropTypes.bool,
  waitTime:PropTypes.string,
  redirectFrom:PropTypes.string,
  onSuccessFunction:PropTypes.func, //Not required and actually not used anymore now that method is redirect
  onFailureFunction:PropTypes.func // and not popup like it used to be.  Will refactor and remove later.
};

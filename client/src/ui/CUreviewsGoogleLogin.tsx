// @ts-nocheck
// The existing code is problematic...

import React, {Component} from 'react';
import { GoogleLogin, GoogleLoginResponse } from 'react-google-login';
import { Session } from '../meteor-session';

/*
  Google Login C Component. Specific to this project.

  Start all components with this description format:

  Container component for the Google log in button so that it can be easily placed
  anywhere on the site.  Includes unecessary saving to DB and setting session methods

*/

type Props = {
  readonly executeLogin: boolean;
  readonly waitTime: number;
  readonly redirectFrom: string;
};

export default class CUreviewsGoogleLogin extends Component<Props, { lastVerification: number }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      lastVerification: (new Date().getTime()) - 5000
    }

    //Save redirect page
    //Will be either "admin" or "course"
    this.saveRedirectToSession(this.props.redirectFrom);
  }

  //Using meteor session to save the redirct page to Session
  saveRedirectToSession = (from: string) => {
    Session.setPersistent({"redirectFrom": from});
    if (Session.get("redirectFrom") !== from){
      console.log("Error saving redirectFrom to session");
      return 0;
    }
    return 1;
  };

  //This callback function is only called when Google Log-In uses a pop-up.  We now use a redirect
  // instead.  Therefore this callback is never used/called but I'll leave here for furture reference.
  // Previously called by adding: onSuccess={this.responseGoogle.bind(this)}
  // as a prop passed into <GoogleLogin> component below.
  responseGoogle = (response: GoogleLoginResponse) => {
    const token = response.tokenId;
    if (token){
      // @ts-ignore
      if (this.saveToken(token) === 1){
        console.log(Session.get("token"));
        // console.log("Succesfully saved token to session");
      } else{
        console.log("Error saving token");
      }
      this.setState({lastVerification : new Date().getTime()});
    }
  }

  getRedirectURI = () => {
    if(window.location.host.includes("localhost")){
      return "http://" + window.location.host + "/auth/"
    }
      return "https://" + window.location.host + "/auth/"
  };

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

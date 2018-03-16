import React, { Component, PropTypes } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Users } from '../api/classes.js';
import {BrowserRouter, Route } from "react-router-dom";
import { HTTP } from 'meteor/http';

/*
  Auth Component. INCOMPLETE.

  Backend Container component that handles login logistics and inteactions with Google login API.
*/

export default class Auth extends Component {
  constructor(props) {
    super(props);

    console.log(this.props.params);
    Meteor.call('printOnServer', this.props.params);
    //send back some random token

  }

  //given a incoming post request, generate a token for this user
  generateToken(user) {

  }

  //save the token against this user, or add in a new user if needed
  saveToken() {

  }

  render() {
    return (
      <div>We will never get here</div>
    );
  }
}

// takes no props
Auth.propTypes = {
};

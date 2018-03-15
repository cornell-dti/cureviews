import React, { Component, PropTypes } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Users } from '../api/classes.js';
import {BrowserRouter, Route } from "react-router-dom";
import { HTTP } from 'meteor/http';

/*
  auth Component. Backend component that handles login logistics and
  inteactions with Google login API.

  Renders the applicaiton homepage with a navbar and searchbar, popular
  classes and recent reviews components.
*/

export class Auth extends Component {
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

Auth.propTypes = {
  users: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default withTracker(props => {
  const subscription = Meteor.subscribe('users', "-1"); //get all users
  const loading = !subscription.ready();
  const users = Users.find({}).fetch();
  return {
    users,
  };
}) (Auth);

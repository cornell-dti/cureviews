import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Users } from '../api/classes.js';
import {BrowserRouter, Route } from "react-router-dom";
import { HTTP } from 'meteor/http';

// Holder backend component that is accessed by the login API.
// API sends user data as POST request. This component reads the data,
// creates a token for this user, saves it to the DB, and sends it back to the
// API (in encrypted format)
export class Auth extends Component {
  //props: none incoming, grabs Users in DB.
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

//define the props for this object
Auth.propTypes = {
  users: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default createContainer((props) => {
  const subscription = Meteor.subscribe('users', "-1"); //get all users
  const loading = !subscription.ready();
  const users = Users.find({}).fetch();
  //console.log(users);
  return {
    users,
  };
}, Auth);

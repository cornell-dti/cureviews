import React, { Component } from 'react';
import PropTypes from 'prop-types';

/*
  Auth Component. INCOMPLETE.

  Backend Container component that handles login logistics and inteactions with Google login API.
*/

export default class Auth extends Component {
  constructor(props) {
    super(props);

    console.log(this.props.params);
    console.log("hello");
    Meteor.call('printOnServer', this.props.params);
    //send back some random token

  }

  //given a incoming post request, generate a token for this user
  generateToken(/* user */) {

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
  params: PropTypes.object.isRequired
};

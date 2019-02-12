import React, { Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/dbDefs.js';
import Admin from './Admin.jsx';
import "./css/Login.css";

/*
  Admin Interface Login Component.

  View component accessed via /admin.

  Requests a password from the user and validates it with the password stored in the database.
  If the user enters the correct password, the Admin Interface is displayed using
  the Admin component. Otherwise, an error message is displayed.

*/

export default class Login extends Component {
  constructor(props) {
    super(props);

    // input elements are controlled components. Store the value of the
    // user's input password and its validation state.
    this.state = {
      pass: "",
      message: ""
    };

    this.defaultState = this.state;
  }

  // Save the user input text from the text box in the local state.
  // Called whenever the input element changes to trigger re-render.
  handlePassChange(event) {
    this.setState({ pass: event.target.value });
  }

  // Handle a form submission to compare the user input to the password
  // stored in the local database. If the validation passes, changed the
  // local state 'validated' to true, otherwise, give an error message.
  handleSubmit(event) {
    // pause auto-submit
    event.preventDefault();

    //ensure all fields are filled out
    var pass = this.state.pass.trim();
    if (pass.length > 0 && pass !== null && this.validateInputs(pass)) {
      // call the vailidate funtion
      Meteor.call('vailidateAdmin', pass, (error, result) => {
        if (!error && result==1) {
          // Success, set 'validate' in local state
          newState = {
            pass: ""
          };
          Session.set('adminlogin', true);
          this.setState(newState);
        } else {
          // otherwise, clear the input and send error message.
          this.setState(this.defaultState);
          this.setState({message: "Incorrect Password"});
        }
      });
    }
  }

  // Check if the provided password is a valid string and not malicious to
  // the database.
  validateInputs(text) {
    // ensure there are no illegal characters
    var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'\/$ ]+$/i)
    return regex.test(text);
  }

  render() {
    // if password was valid, show admin interface, otherwise ask for the password.
    if (Session.get("adminlogin")) {
      return (
        <Admin />
      );
    } else {
      return (
        <div className="container whiteBg">
          <div className="pushDown">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Enter Admin Password</h3>
              </div>
              <div className="panel-body">
                <form onSubmit={this.handleSubmit.bind(this)} >
                  <div className="input-group fullInput">
                    <input type="password" className="form-control" ref="input" value={this.state.pass} onChange={(event) => this.handlePassChange(event)} />
                  </div>
                  <div>
                    <p className="error-message">{this.state.message}</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

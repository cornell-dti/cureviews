import React, { Component } from 'react';
import Admin from './Admin.jsx';
import CUreviewsGoogleLogin from './CUreviewsGoogleLogin.jsx';
import "./css/Login.css";
import { Session } from 'meteor/session';

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
    this.changeSession = this.changeSession.bind(this)
  }

  changeSession(){
    console.log("Change session");
    Session.set("adminlogin", true);
    this.setState({"pass" : "two"});
  }

  render() {
    // if password was valid, show admin interface, otherwise ask for the password.
    if (Session.get("adminlogin") === true) {
      return (
        <Admin />
      );
    } else {
      return (
        <div className="container whiteBg">
          <div className="pushDown">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Please wait to be authenticated</h3>
              </div>
              <div className="panel-body">
                <CUreviewsGoogleLogin 
                      executeLogin={true} 
                      waitTime="1500"
                      onSuccessFunction={this.changeSession}
                      onFailureFunction={this.responseGoogle} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

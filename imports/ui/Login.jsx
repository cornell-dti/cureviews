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
      message: "",
      executeLogin: false
    };

    this.defaultState = this.state;
  }
  
  componentWillMount() {
    // The following is used to show admin panel if a user's token is found to be an admin
    if(Session.get("token") != ""){
      Meteor.call('tokenIsAdmin', Session.get("token"), (error, result) => {
        if(result){
          Session.set("adminlogin", true);
          this.setState({executeLogin: false}); //This isn't necessary as it should alrady be allFalse
                                                // but it is used to refresh the render()
        }
        else{
          this.setState({executeLogin: true});
        }
      });
    }
    else{
      this.setState({executeLogin: true});
    }
  }

  render() {
    // If Google login was valid, show admin interface.
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
                    executeLogin={this.state.executeLogin}
                    waitTime="1500"
                    redirectFrom="admin" />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

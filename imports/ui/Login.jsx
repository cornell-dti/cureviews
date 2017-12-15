import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/classes.js';
import Update from './Update.jsx';
// Form component to allow user to add a review for selected course.
// Takes in a course ID.
// validation uses react controlled form elements as described at https://goshakkk.name/instant-form-fields-validation-react/
export default class Login extends Component {
  constructor(props) {
    super(props);

    //store all currently selected form values in the state.
    //this will be the default state.
    this.state = {
      pass: "",
      validated: false,
      message: ""
    };

    this.defaultState = this.state;
  }

  //save the pass, trigger re-render
  handlePassChange(event) {
    this.setState({ pass: event.target.value });
  }

  // handle a form submission. This will either add the review to the database
  // or return an error telling the user to try agian.
  handleSubmit(event) {
    event.preventDefault();

    //ensure all fields are filled out
    var pass = this.state.pass.trim();
    if (pass.length > 0 && pass !== null) {
      // call the vailidate funtion
      Meteor.call('vailidateAdmin', pass, (error, result) => {
        if (!error && result==1) {
          // Success, set in statealidate
          newState = {
            pass: "",
            validated: true
          };
          this.setState(newState);
        } else {
          this.setState(this.defaultState);
          this.setState({message: "Incorrect Password"});
        }
      });
    }
  }

  //check if the state variables in the review are valid
  validateInputs(median, attend, text) {
    //ensure there are no illegal characters
    var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'\/$ ]+$/i)
    console.log(this.state.postClicks);
    errs = {
      median: median === null || median === undefined,
      attend: attend === null || attend === undefined,
      textEmpty: this.state.postClicks > 0 && (text === null || text === undefined || text.length === 0),
      text: text != null && text != undefined && text.length > 0 && !regex.test(text),
      allFalse: false
    }
    errs.allTrue = !(errs.median || errs.attend || errs.text || errs.textEmpty);
    return errs;
  }

  render() {
    //check to see if all inputs are valid. If not, disable the post button and
    //add a border around inputs that need to be changed.
    if (this.state.validated) {
      return (
        <Update />
      );
    } else {
      return (
        <form onSubmit={this.handleSubmit.bind(this)} >
          <div className="panel panel-default">
            Enter Admin Password
            <div className="panel-body">
              <input ref="input" type="text" value={this.state.pass} onChange={(event) => this.handlePassChange(event)} />
              <div>{this.state.message}</div>
            </div>
          </div>
        </form>
      );
    }
  }
}

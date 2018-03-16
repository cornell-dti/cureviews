import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/classes.js';
import './css/Form.css';
import { Bert } from 'meteor/themeteorchef:bert'; // alert library, https://themeteorchef.com/tutorials/client-side-alerts-with-bert

/*
  Form Component. Displays a from that allows the user to submit a single reivew for a given class.

  Takes in a course id for the course this review is for.

  Before inserting a review, it is validated  for illegal characters and to
  ensure all fields are filled in. Form componets are implemented as 'controlled
  components' to run validation, as described at https://goshakkk.name/instant-form-fields-validation-react/
  and in the course review docs.

  Once a review is submitted (with an 'unapproved' flag), the Bart library is
  used to display an alert message telling the user the review was submitted and pending approval,
  or that an error occured.
*/

export default class Form extends Component {
  constructor(props) {
    super(props);

    // define bart alert message constants
    Bert.defaults = {
      hideDelay: 4000, //time before the alert shows up
      style: 'growl-top-left', // location and animation of alert
      type: 'success' // color styling
    };

    //store all currently selected form values in the state.
    this.state = {
      diff: 3,
      quality: 3,
      median: 0,
      attend: 1,
      text: "",
      message: null,
      postClicks: 0,
    };

    // store inital values as the default state to revert to after submission
    this.defaultState = this.state;
  }

  // Save the current user input text from the text box in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleTextChange = (event) => {
    this.setState({text: event.target.value});
  }

  // Save the current user selected value for attendence (as an integer) in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleAttendChange = (event) => {
    this.setState({ attend: parseInt(event.target.value) });
  }

  // Save the current user selected value for median grade in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleMedianChange = (event) => {
    this.setState({ median: parseInt(event.target.value) });
  }

  // Save the current user selected value for quality in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleQualChange(event) {
    this.setState({ quality: parseInt(event.target.value) });
  }

  // Convert the quality slider's value to a color.
  getQualColor(value) {
    var colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value]
    }
  }

  // Save the current user selected value for difficulty in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleDiffChange(event) {
    this.setState({ diff: parseInt(event.target.value) });
  }

  // Convert the difficulty slider's value to a color.
  getDiffColor(value) {
    var colors = ["#53B277", "#53B277", "#f9cc30", "#f9cc30", "#E64458", "#E64458"];
    return {
      backgroundColor: colors[value],
    }
  }

  // Called each time this component is re-rendered, and resets the values of the sliders to 3.
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
    ReactDOM.findDOMNode(this.refs.qualSlider).value = 3;
    this.setState(this.defaultState);
  }

  // Called each time this component receieves new props.
  // resets the values of the sliders to 3 and sets the state to the default state.
  componentWillReceiveProps(nextProps) {
    if (nextProps.courseId != this.props.courseId) {
      ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
      ReactDOM.findDOMNode(this.refs.qualSlider).value = 3;
      this.setState(this.defaultState);
    }
  }

  // Form submission handler. This will either add the review to the database
  // and trigger a success message, or error and ask the user to try again.
  handleSubmit(event) {
    // 'pause' automatic form submisson
    event.preventDefault();

    // ensure all fields are filled out
    var text = this.state.text.trim();
    var median = this.state.median;
    var atten = this.state.attend;
    var diff = this.state.diff;
    var qual = this.state.quality;
    if (text.length > 0 && text !== null && median !== null && atten !== null) {
      // create new review object
      var newReview = {
        text: text,
        diff: diff,
        quality: qual,
        medGrade: median,
        atten: atten
      };

      // call the api insert function
      Meteor.call('insert', newReview, this.props.courseId, (error, result) => {
        if (!error && result === 1) {
          // Success, so reset form
          ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
          ReactDOM.findDOMNode(this.refs.qualSlider).value = 3;

          this.setState(this.defaultState);
          Bert.alert('Thanks! Your review is currently pending approval.');
        } else {
          // error, alert user
          console.log(error);
          this.setState({message: "A error occurred. Please try again."});
        }
      });
    }
  }

  // Validation function. Checks if the median and attendence are filled out,
  // and checks text for any unaccepted symbols
  validateInputs(median, attend, text) {
    //ensure there are no illegal characters
    var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'\/$ ]+$/i)
    errs = {
      median: median === null || median === undefined,
      attend: attend === null || attend === undefined,
      textEmpty: this.state.postClicks > 0 && (text === null || text === undefined || text.length === 0),
      text: text != null && text !== undefined && text.length > 0 && !regex.test(text),
      allFalse: false
    };
    errs.allTrue = !(errs.median || errs.attend || errs.text || errs.textEmpty);
    return errs;
  }

  render() {
    // check to see if all inputs are valid. If some inputs are invalide, disable the
    // post button and add red border around inputs that need to be changed.
    var err = this.validateInputs(this.state.median, this.state.attend, this.state.text);
    var isEnabled = err.allTrue;
    return (
        <div>
          <legend className="review-header">Leave a Review</legend>
          <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
              <div className="panel panel-default">
                  <div className="panel-body-2" id="form">
                      <textarea ref="textArea" className={err.text || err.textEmpty ? "error" : ""} type="text" value={this.state.text}
                        onChange={(event) => this.handleTextChange(event)}
                        placeholder="Enter your class feedback here! Try to mention helpful details like which professor taught the class or what semester you took it." />
                      <div ref="emptyMsg" className={err.textEmpty ? "" : "hidden"}>Please add text to your review!</div>
                      <div className={err.text && this.state.text != "" ? "" : "hidden"} id="errorMsg" >Your review contains illegal characters, please remove them.</div>
                      <hr className="divider" />
                      <div className="row">
                          <div className="col-md-3">
                              <h1 className="secondary-text">Overall Quality</h1>
                          </div>
                          <div className="col-md-1">
                              <div className="small-icon" id="sm1" style={this.getQualColor(this.state.quality)}>
                                  <p>{this.state.quality}</p>
                              </div>
                          </div>
                          <div className="col-md-8 sliderHolder">
                             <input ref="qualSlider" onChange={(event) => this.handleQualChange(event)} type="range" id="a2" name="qual" min="0" max="5" step="1" />
                          </div>
                      </div>
                      <div className="sm-spacing"></div>
                      <div className='row'>
                          <div className="col-md-3">
                              <h1 className="secondary-text">Level of Difficulty</h1>
                          </div>
                          <div className="col-md-1">
                              <div className="small-icon" id="sm2" style={this.getDiffColor(this.state.diff)}>
                                  <p>{this.state.diff}</p>
                              </div>
                          </div>
                          <div className="col-md-8 sliderHolder">
                              <input ref="diffSlider" onChange={(event) => this.handleDiffChange(event)} type="range" id="a2" name="qual" min="0" max="5" step="1" />
                          </div>
                      </div>
                      <div className="sm-spacing"></div>
                      <div className="row">
                          <div className="col-md-4">
                              <div className="secondary-text">Estimated Median</div>
                          </div>
                          <div className="col-md-8 selectAlignment">
                              <select value={this.state.median} onChange={(event) => this.handleMedianChange(event)}>
                                  <option value="0">I don&#39;t know</option>
                                  <option value="9">A+</option>
                                  <option value="8">A</option>
                                  <option value="7">A-</option>
                                  <option value="6">B+</option>
                                  <option value="5">B</option>
                                  <option value="4">B-</option>
                                  <option value="3">C+</option>
                                  <option value="2">C</option>
                                  <option value="1">C-</option>
                              </select>
                          </div>
                      </div>
                      <div className="sm-spacing"></div>
                      <div className="row">
                          <div className="col-md-4">
                              <div className="secondary-text">Attendance</div>
                          </div>
                          <div className="col-md-8 selectAlignment">
                              <select value={this.state.attend} onChange={(event) => this.handleAttendChange(event)}>
                                  <option value="0">Not Mandatory</option>
                                  <option value="1">Mandatory</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="row">
                  <div className="col-md-9">
                      <h2 className="secondary-text">All posts are completely anonymous to ensure constructive, honest feedback. You must have previously been enrolled in this class to give feedback.</h2>
                  </div>
                  <div className="col-md-3">
                      <button  disabled={!isEnabled} id = "postbutton" onClick={() => {this.setState({postClicks: this.state.postClicks +1});}}>Post</button>
                  </div>
              </div>
              <div className="row">
                  <div className="col-sm-12">
                      <h2 className="secondary-text">{this.state.message}</h2>
                  </div>
              </div>
          </form>
        </div>
    );
  }
}

// Form must be provided the course id of the class this review will be for.
Form.propTypes = {
  courseId: PropTypes.string.isRequired,
};

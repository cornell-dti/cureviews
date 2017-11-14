import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/classes.js';
import './css/Form.css';

// Form component to allow user to add a review for selected course.
// Takes in a course ID.
// validation uses react controlled form elements as described at https://goshakkk.name/instant-form-fields-validation-react/
export default class Form extends Component {
  constructor(props) {
    super(props);

    //store all currently selected form values in the state.
    //this will the default state.
    this.state = {
      diff: 3,
      quality: 3,
      median: 5,
      attend: 1,
      text: "",
      message: null,
    };
  }

  //save the current written values in the text box and trigger re-render
  handleTextChange = (event) => {
    this.setState({text: event.target.value});
  }

  //save the selected value for attendence as an integer and trigger re-render
  handleAttendChange = (event) => {
    this.setState({ attend: parseInt(event.target.value) });
  }

  //save the selected class median as an integer and trigger re-render
  handleMedianChange = (event) => {
    this.setState({ median: parseInt(event.target.value) });
  }

  //change the state to represent the new form quality value and trigger re-render
  handleQualChange(event) {
    var newState = this.state;
    newState.quality = event.target.value;
    this.setState(newState);
  }

  //get color for quality value
  getQualColor(value) {
    var colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value]
    }
  }

  //change the state to represent the new form difficulty value and trigger re-render
  handleDiffChange(event) {
    var newState = this.state;
    newState.diff = event.target.value;
    this.setState(newState);
  }

  //get color for difficulty value
  getDiffColor(value) {
    var colors = ["#53B277", "#53B277", "#f9cc30", "#f9cc30", "#E64458", "#E64458"];
    return {
      backgroundColor: colors[value],
    }
  }

  //after the initial render, set the values of the sliders
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
    ReactDOM.findDOMNode(this.refs.qualSlider).value = 3;
  }

  // handle a form submission. This will either add the review to the database
  // or return an error telling the user to try agian.
  handleSubmit(event) {
    event.preventDefault();

    //ensure all fields are filled out
    const text = this.state.text.trim();
    const median = this.state.median;
    const atten = this.state.attend;
    if (text !== null && median !== null && atten !== null) {
      // create new review object
      var newReview = {
        text: text,
        diff: parseInt(this.state.diff),
        quality: parseInt(this.state.quality),
        medGrade: median,
        atten: atten
      };

      //call the insert funtion
      Meteor.call('insert', newReview, this.props.courseId, (error, result) => {
        if (!error && result==1) {
          // Success, so reset form
          ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
          ReactDOM.findDOMNode(this.refs.qualSlider).value = 3;
          this.setState({
            diff:3,
            quality: 3,
            median: 5,
            attend: 1,
            text: "",
            message: "Thanks! Your review is pending approval."
          });
        } else {
          console.log(error);
          this.setState({message: "A error occurred. Please try again."});
        }
      });
    }
  }

  //check if the state variables in the review are valid
  validateInputs(median, attend, text) {
    //ensure there are no illegal characters
    var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'\/$ ]+$/i)
    errs = {
      median: median === null || median === undefined,
      attend: attend === null || attend === undefined,
      text: text === null || text === undefined || text.length === 0 || !regex.test(text),
      allFalse: false
    }
    errs.allTrue = !(errs.median || errs.attend || errs.text);
    return errs;
  }

  render() {
    //check to see if all inputs are valid. If not, disable the post button and
    //add a border around inputs that need to be changed.
    var err = this.validateInputs(this.state.median, this.state.attend, this.state.text);
    var isEnabled = err.allTrue;
    return (
        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
            <div className="panel panel-default">
                <div className="panel-body">
                    <textarea className={err.text && this.state.text != "" ? "error" : ""} type="text" value={this.state.text} onChange={(event) => this.handleTextChange(event)} placeholder="Does your professor tell funny jokes? Leave your feedback here!" />
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
                            <div className="secondary-text">Class Median</div>
                        </div>
                        <div className="col-md-8">
                            <select value={this.state.median} onChange={(event) => this.handleMedianChange(event)}>
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
                        <div className="col-md-8">
                            <select value={this.state.attend} onChange={(event) => this.handleAttendChange(event)}>
                                <option value="0">Not Mandatory</option>
                                <option value="1">Mandatory</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-10">
                    <h2 className="secondary-text">All posts are completely anonymous to ensure constructive, honest feedback. You must have previously been enrolled in this class to give feedback.</h2>
                </div>
                <div className="col-md-2">
                    <input disabled={!isEnabled} type="submit" value="Post" id="postbutton"/>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <h2 className="secondary-text">{this.state.message}</h2>
                </div>
            </div>
        </form>
    );
  }
}

Form.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  courseId: PropTypes.string.isRequired,
};

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/classes.js';
import './css/Form.css';
import { Bert } from 'meteor/themeteorchef:bert'; //alert library, https://themeteorchef.com/tutorials/client-side-alerts-with-bert

// Form component to allow user to add a review for selected course.
// Takes in a course ID.
// validation uses react controlled form elements as described at https://goshakkk.name/instant-form-fields-validation-react/
export default class Form extends Component {
  constructor(props) {
    super(props);

    Bert.defaults = {
      hideDelay: 4000,
      style: 'growl-top-left',
      type: 'success'
    };
    //store all currently selected form values in the state.
    //this will be the default state.
    this.state = {
      diff: 3,
      quality: 3,
      median: 0,
      attend: 1,
      text: "",
      message: null,
      postClicks: 0,
    };

    this.defaultState = this.state;
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
    this.setState({ quality: parseInt(event.target.value) });
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
    this.setState({ diff: parseInt(event.target.value) });
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

  //reload the form when a new class is selected
  componentWillReceiveProps(nextProps) {
    if (nextProps.courseId != this.props.courseId) {
      ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
      ReactDOM.findDOMNode(this.refs.qualSlider).value = 3;
      this.setState(this.defaultState);
    }
  }

  // handle a form submission. This will either add the review to the database
  // or return an error telling the user to try agian.
  handleSubmit(event) {
    event.preventDefault();

    //ensure all fields are filled out
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

      console.log("ready to submit");
      // call the insert funtion
      Meteor.call('insert', newReview, this.props.courseId, (error, result) => {
        if (!error && result==1) {
          // Success, so reset form
          ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
          ReactDOM.findDOMNode(this.refs.qualSlider).value = 3;

          this.setState(this.defaultState);
          Bert.alert('Thanks! Your review is currently pending approval.');
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
    var err = this.validateInputs(this.state.median, this.state.attend, this.state.text);
    var isEnabled = err.allTrue;
    return (
        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
            <div className="panel panel-default">
                <div className="panel-body">
                    <textarea ref="textArea" className={err.text || err.textEmpty ? "error" : ""} type="text" value={this.state.text} onChange={(event) => this.handleTextChange(event)}
                              placeholder="Enter your class feedback here! Try to mention helpful details like which professor
                              taught the class or what semester you took it." />
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
                <div className="col-md-10">
                    <h2 className="secondary-text">All posts are completely anonymous to ensure constructive, honest feedback. You must have previously been enrolled in this class to give feedback.</h2>
                </div>
                <div className="col-md-2">
                    <button id = "postbutton" onClick={() => {this.setState({postClicks: this.state.postClicks +1});}}>Post</button>
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

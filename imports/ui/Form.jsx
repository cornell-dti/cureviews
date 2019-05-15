import React, { Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/dbDefs.js';

import { Bert } from 'meteor/themeteorchef:bert'; // alert library, https://themeteorchef.com/tutorials/client-side-alerts-with-bert
import CUreviewsGoogleLogin from './CUreviewsGoogleLogin.jsx';
import Select from 'react-select';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import './css/Form.css';
import { Session } from 'meteor/session';

/*
  Form Component.

  Container component that displays a form allowing the user to submit a
  single reivew for a given class.

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
      hideDelay: 5000, //time alert stays on screen
      style: 'growl-top-right', // location and animation of alert
      type: 'success' // color styling
    };

    //store all currently selected form values in the state.
    this.state = {
      dropdown: '', //empty as opposed to 'open'
      visible: false,
      rating: 3,
      diff: 3,
      workload: 3,
      // median: { value: 0, label: 'I don\'t know' }, //Default for median selecter
      text: "",
      message: null,
      postClicks: 0,
      selectedProfessors: [],
      professors: this.props.course.classProfessors,
      review: {}
      // checkedProfs : Array((this.props.course.classProfessors).length).fill(false), //array of false with len of number of profs to represent checked boxes
    };

    // store inital values as the default state to revert to after submission
    this.defaultState = this.state
    this.handleProfChange.bind(this)
    this.toggleDropdown.bind(this)
    this.submitReview = this.submitReview.bind(this)
    this.hide = this.hide.bind(this)
    this.show = this.show.bind(this)
  }

  // Save the current user input text from the text box in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleTextChange = (event) => {
    this.setState({text: event.target.value});
  }

  // Save the current user selected value for rating in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleRatingChange(event) {
    this.setState({ rating: parseInt(event.target.value) });
  }

  // Save the current user selected value for difficulty in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleDiffChange(event) {
    this.setState({ diff: parseInt(event.target.value) });
  }

  // Save the current user selected value for quality in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleWorkChange(event) {
    this.setState({ workload: parseInt(event.target.value) });
  }

  // Save the current professor selected string for professors in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleProfChange(selectedProfessors){
    // console.log(selectedProfessors.map(professor => {return professor.label}))
    this.setState({ selectedProfessors: selectedProfessors });
    this.pushReviewsDown(this.state.dropdown);
  }

  // Convert the slider's value to a color starting with red and ending with green.
  getSliderColorRedToGreen(value) {
    var colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value]
    }
  }

  // Convert the slider's value to a color starting with green and ending with red.
  getSliderColorGreenToRed(value) {
    var colors = ["#53B277", "#53B277", "#f9cc30", "#f9cc30", "#E64458", "#E64458"];
    return {
      backgroundColor: colors[value],
    }
  }

  // Called each time this component is re-rendered, and resets the values of the sliders to 3.
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.ratingSlider).value = 3;
    ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
    ReactDOM.findDOMNode(this.refs.workloadSlider).value = 3;
    this.dropdownHeight = ReactDOM.findDOMNode(this.refs.dropdownMenu).clientHeight + 15;
    this.toggleDropdown(); //Open review dropdown when page loads
  }

  // Called each time this component receieves new props.
  // resets the values of the sliders to 3 and sets the state to the default state.
  componentWillReceiveProps(nextProps) {
    if (nextProps.course != this.props.course) {
      ReactDOM.findDOMNode(this.refs.ratingSlider).value = 3;
      ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
      ReactDOM.findDOMNode(this.refs.workloadSlider).value = 3;
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
    var rate = this.state.rating;
    var diff = this.state.diff;
    var work = this.state.workload;
    var prof = this.state.selectedProfessors.map(professor => {return professor.label});
    if (text.length > 0
      && text !== null
      && prof !== []) {
        // create new review object
        var newReview = {
          text: text,
          rating: rate,
          diff: diff,
          workload: work,
          professors: prof,
        };
        this.setState({"review" : newReview})
        
        this.show();
    }
  }
  
  submitReview(){
    // call the api insert function
    Meteor.call('insert', Session.get("token"), this.state.review, this.props.course._id, (error, result) => {
      // if (!error && result === 1) {
      if (error || result === 1) {
        // Success, so reset form
        ReactDOM.findDOMNode(this.refs.ratingSlider).value = 3;
        ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
        ReactDOM.findDOMNode(this.refs.workloadSlider).value = 3;
        ReactDOM.findDOMNode(this.refs.profSelect).value = "none";
        this.toggleDropdown(); //Close the review dropdown when page loads
    
        this.setState(this.defaultState);
        this.hide();
        
        Bert.alert('Thanks! Your review is currently pending approval.');
      } else {
        // error, alert user
        console.log(error);
        this.setState({message: "A error occurred. Please try again."});
      }
    });
  }

  // Validation function. Checks if the median are filled out,
  // and checks text for any unaccepted symbols
  validateInputs(text, prof) {
    //ensure there are no illegal characters
    // TODO un-comment the next line
    var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'\/$ ]+$/i);
    errs = {
      textEmpty: this.state.postClicks > 0 && (text === null || text === undefined || text.length === 0),
      text: text != null && text !== undefined && text.length > 0 && !regex.test(text),
      professorsEmpty: this.state.postClicks > 0 && (this.state.professors.length > 0 && this.state.selectedProfessors.length == 0),
      allFalse: false
    };
    errs.allTrue = !(errs.text || errs.textEmpty || errs.professorsEmpty);
    // console.log(errs);
    return errs;
  }

  getProfOptions() {
    if (this.props.course.classProfessors != []) {
      var profOptions = []
      for(var prof in this.props.course.classProfessors){
        var professorName = this.props.course.classProfessors[prof]

        profOptions.push({
          "value" : professorName,
          "label" : professorName
        })
      }
      return profOptions
    }
  }

  // Return the options for median grades
  // TODO deprecate this as we are no longer collecting this metric
  getMedianOptions() {

    const medianGrades = [
      { value: 0, label: 'I don\'t know' },
      { value: 9, label: 'A+' },
      { value: 8, label: 'A' },
      { value: 7, label: 'A-' },
      { value: 6, label: 'B+' },
      { value: 5, label: 'B' },
      { value: 4, label: 'B-' },
      { value: 3, label: 'C+' },
      { value: 2, label: 'C' },
      { value: 1, label: 'C-' }
    ]
    return medianGrades
  }
    // Toggle the form dropdown
    // Takes care of "pushing down" the reviews by the dynamic height of the form
    toggleDropdown(){
       var nextState = this.state.dropdown == 'open' ? '' : 'open';
       this.setState({ dropdown: nextState });
       this.pushReviewsDown(nextState);
    }

    //Pushes down the reviews from the form depending on how long the form becomes
    //Uses the margin-bottom attribute to do this
    pushReviewsDown(formState){
      var marginHeight;
      var offsetHeight;
      // Form is opened
      if (formState == 'open'){
        marginHeight = this.dropdownHeight;
        offsetHeight = ReactDOM.findDOMNode(this.refs.selectHolder).offsetHeight - 46;
      }
      // Form is closed
      else{
        marginHeight = 0;
        offsetHeight = 0;
      }
      $("#form-dropdown").css("margin-bottom", (marginHeight + offsetHeight) + "px");
    }
    show() {
        this.setState({ visible: true });
    }

     hide() {
      this.setState({ visible: false });
    }
  render() {
    var theClass = this.props.course;
    // check to see if all inputs are valid. If some inputs are invalide, disable the
    // post button and add red border around inputs that need to be changed.
    var err = this.validateInputs(this.state.text, this.state.professors);
    var isEnabled = err.allTrue;
    return (
        <div>
          <div id="form-dropdown" className={'dropdown ' + this.state.dropdown}>
            <button id="dropdown-button" onClick={this.toggleDropdown.bind(this)}  aria-haspopup="true" aria-expanded="true">
              <div className="row noLeftRightMargin">
                <div className="col-md-6">
                  <p className="review-header">Leave a Review</p>
                </div>
                <div className="col-md-6 padding-right-40">
                  <i className={'arrow float-r '+ (this.state.dropdown == 'open' ? 'up' : 'down')}></i>
                </div>
              </div>

            </button>
            <ul id="dropdown-menu" className="dropdown-menu" ref="dropdownMenu">
              <form className="new-task" onSubmit={this.handleSubmit.bind(this)} ref="formElement">
                      <div className="panel-body-2" id="form">
                          <div className="row" id="reviewTextRow">
                            <textarea ref="textArea" className={err.text || err.textEmpty ? "error" : ""} type="text" value={this.state.text}
                              onChange={(event) => this.handleTextChange(event)}
                              placeholder="Enter your feedback here! Try to mention helpful details like which semester you took it, what the homework was like, etc." />
                            <div ref="emptyMsg" className={err.textEmpty ? "form-field-error" : "hidden"}>Please add text to your review!</div>
                            <div className={err.text && this.state.text != "" ? "form-field-error" : "hidden"} id="errorMsg" >Your review contains illegal characters, please remove them.</div>
                          </div>

                          <hr className="divider" />
                          <div className="row">
                              <div className="col-md-3 col-sm-3 col-xs-3">
                                  <h1 className="secondary-text">Overall Rating</h1>
                              </div>
                              <div className="col-md-1 col-sm-1 col-xs-1">
                                  <div className="rating-icon" id="sm1" style={this.getSliderColorRedToGreen(this.state.rating)}>
                                      <p>{this.state.rating}</p>
                                  </div>
                              </div>
                              <div className="col-md-8 col-sm-8 col-xs-8 sliderHolder">
                                 <input ref="ratingSlider" onChange={(event) => this.handleRatingChange(event)} type="range" id="rating" name="rating" min="1" max="5" step="1" />
                              </div>
                          </div>
                          <div className="sm-spacing"></div>
                          <div className="row">
                              <div className="col-md-3 col-sm-3 col-xs-3">
                                  <h1 className="secondary-text">Difficulty</h1>
                              </div>
                              <div className="col-md-1 col-sm-1 col-xs-1">
                                  <div className="rating-icon" id="sm1" style={this.getSliderColorGreenToRed(this.state.diff)}>
                                      <p>{this.state.diff}</p>
                                  </div>
                              </div>
                              <div className="col-md-8 col-sm-8 col-xs-8 sliderHolder">
                                 <input ref="diffSlider" onChange={(event) => this.handleDiffChange(event)} type="range" id="diff" name="diff" min="1" max="5" step="1" />
                              </div>
                          </div>
                          <div className="sm-spacing"></div>
                          <div className='row'>
                              <div className="col-md-3 col-sm-3 col-xs-3">
                                  <h1 className="secondary-text">Workload</h1>
                              </div>
                              <div className="col-md-1 col-sm-1 col-xs-1">
                                  <div className="rating-icon" id="sm2" style={this.getSliderColorGreenToRed(this.state.workload)}>
                                      <p>{this.state.workload}</p>
                                  </div>
                              </div>
                              <div className="col-md-8 col-sm-8 col-xs-8 sliderHolder">
                                  <input ref="workloadSlider" onChange={(event) => this.handleWorkChange(event)} type="range" id="work" name="work" min="1" max="5" step="1" />
                              </div>
                          </div>
                          <div className="sm-spacing"></div>
                          <div className="row">
                              <div className="col-md-3 col-sm-3 col-xs-3">
                                  <div className="secondary-text">Professor</div>
                              </div>
                              <div className="col-md-8 col-sm-8 col-xs-8 selectAlignment" ref="selectHolder">
                                  <Select value={this.state.selectedProfessors}
                                    onChange={(professors) => this.handleProfChange(professors)}
                                    isMulti
                                    options={this.getProfOptions()}
                                    ref="profSelect"
                                  />
                                  <div ref="noProfMsg" className={err.professorsEmpty ? "form-field-error" : "hidden"}>Please select the professor(s) you took this class with!</div>
                              </div>
                          </div>
                          <div className="row">
                            <div className="col-md-12 text-right">
                                <button disabled={!isEnabled} id ="postbutton" onClick={() => {this.setState({postClicks: this.state.postClicks +1});}}>Post</button>
                            </div>
                          </div>
                      </div>


                  <div className="row">
                      <div className="col-sm-12">
                          <h2 className="secondary-text">{this.state.message}</h2>
                      </div>
                  </div>
              </form>
            </ul>
          </div>
          
          <Rodal animation="zoom" height={520} width={window.innerWidth/3} measure="px" className="modalForm" visible={this.state.visible} onClose={this.hide.bind(this)}>
            <div id="modal-background">
              <div id="modal-top">
                <img src='/logo2x.png' className="img-responsive center-block scale-logo-modal" id="img-padding-top" alt="CU Reviews Logo" />
                <p id="modal-title" className="center-block">Email Verification</p>
              </div>
              <div id="">
                <p id="modal-text" className="center-block">
                  You’re almost there! - log in with cornell.edu to
                  verify you are a student. 
                </p>
                <p id="modal-text" className="center-block">
                  (Don’t worry, your identity will always be kept secret!)
                </p>
                <p id="modal-footer" className="center-block">
                  You will be redirected to our login page.
                  Not seeing it? Click here.
                </p>
                <CUreviewsGoogleLogin 
                      executeLogin={this.state.visible}
                      waitTime="1000"  
                      onSuccessFunction={this.submitReview}
                      onFailureFunction={this.responseGoogle} />
              </div>
            </div>
            
          </Rodal>
        </div>
    );
  }
}

// Form must be provided the course object of the class this review will be for.
Form.propTypes = {
  course: PropTypes.object.isRequired,
};

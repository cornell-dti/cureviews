import React, { Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/dbDefs.js';
import './css/Form.css';
import { Bert } from 'meteor/themeteorchef:bert'; // alert library, https://themeteorchef.com/tutorials/client-side-alerts-with-bert
import Select from 'react-select';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
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
      hideDelay: 4000, //time alert stays on screen
      style: 'growl-top-left', // location and animation of alert
      type: 'success' // color styling
    };

    //store all currently selected form values in the state.
    this.state = {
      height: 529,
      visible: false,
      diff: 3,
      workload: 3,
      median: { value: 0, label: 'I don\'t know' }, //Default for median selecter
      text: "",
      message: null,
      postClicks: 0,
      selectedProfessors: null,
      professors: this.props.course.classProfessors,
      // checkedProfs : Array((this.props.course.classProfessors).length).fill(false), //array of false with len of number of profs to represent checked boxes
    };

    // store inital values as the default state to revert to after submission
    this.defaultState = this.state
    this.handleProfChange.bind(this)
    this.handleMedianChange.bind(this)
  }

  // Save the current user input text from the text box in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleTextChange = (event) => {
    this.setState({text: event.target.value});
  }

  // Save the current user selected value for median grade in the local state.
  // Called whenever this form element changes to trigger re-render to run validation.
  handleMedianChange(medianValue) {
    this.setState({ median: medianValue })
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
    console.log(selectedProfessors.map(professor => {return professor.label}))
    this.setState({ selectedProfessors: selectedProfessors })
  }

  // Convert the quality slider's value to a color.
  getWorkColor(value) {
    var colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value]
    }
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
    ReactDOM.findDOMNode(this.refs.workloadSlider).value = 3;
    //ReactDOM.findDOMNode(this.refs.profSelect).value = "none";
  }

  // Called each time this component receieves new props.
  // resets the values of the sliders to 3 and sets the state to the default state.
  componentWillReceiveProps(nextProps) {
    if (nextProps.course != this.props.course) {
      ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
      ReactDOM.findDOMNode(this.refs.workloadSlider).value = 3;
      //ReactDOM.findDOMNode(this.refs.profSelect).value = "none";
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
    var median = this.state.median.value;
    var diff = this.state.diff;
    var work = this.state.workload;
    var prof = this.state.selectedProfessors.map(professor => {return professor.label});
    // var ratingNum =  //#TODO THIS
    // var likesNum = 0; //#TODO THIS
    if (text.length > 0 
      && text !== null 
      && median !== null 
      && prof !== []) {
      // create new review object
      var newReview = {
        text: text,
        diff: diff,
        workload: work,
        medGrade: median,
        professors: prof,
        // likes: likesNum,  //#TODO THIS 
        // rating: ratingNum //#TODO THIS
      };

      // call the api insert function
      Meteor.call('insert', newReview, this.props.course._id, (error, result) => {
        if (!error && result === 1) {
          // Success, so reset form
          ReactDOM.findDOMNode(this.refs.diffSlider).value = 3;
          ReactDOM.findDOMNode(this.refs.workloadSlider).value = 3;
          // ReactDOM.findDOMNode(this.refs.profSelect).value = "none";

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

  // Validation function. Checks if the median are filled out,
  // and checks text for any unaccepted symbols
  validateInputs(median, text, prof) {
    //ensure there are no illegal characters
    // TODO un-comment the next line
        // var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'\/$ ]+$/i)
    errs = {
      median: median === null || median === undefined,
      textEmpty: this.state.postClicks > 0 && (text === null || text === undefined || text.length === 0),
      text: text != null && text !== undefined && text.length > 0 && !regex.test(text),
      professorsEmpty: this.state.postClicks > 0 && (this.state.professors.length > 0 && this.state.selectedProfessors.length == 0),
      allFalse: false
    };
    errs.allTrue = !(errs.median || errs.text || errs.textEmpty || errs.professorsEmpty);
    return errs;
    console.log(errs);
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
  
    show() {
        this.setState({ visible: true });
    }

    hide() {
        this.setState({ visible: false });
        console.log(this.refs.formElement.clientHeight);
        this.setState({ height: this.refs.formElement.clientHeight });
    }
  
    getRodalHeight(){
      console.log("this.refs.formElement.clientHeight");
      // return this.refs.formElement.clientHeight;
      return 530;
    }
  
  render() {
    var theClass = this.props.course
    // check to see if all inputs are valid. If some inputs are invalide, disable the
    // post button and add red border around inputs that need to be changed.
    var err = this.validateInputs(this.state.median, this.state.text, this.state.professors);
    var isEnabled = err.allTrue;
    return (
        <div>
          <legend className="review-header">Leave a Review</legend>
          <button onClick={this.show.bind(this)}>show</button>

          <Rodal animation="slideRight" height={520} width={window.innerWidth/2} measure="px" className="modalForm" visible={this.state.visible} onClose={this.hide.bind(this)}>
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)} ref="formElement">
                    <div className="panel-body-2" id="form">
                        <div className="row" id="reviewTextRow">
                          <textarea ref="textArea" className={err.text || err.textEmpty ? "error" : ""} type="text" value={this.state.text}
                            onChange={(event) => this.handleTextChange(event)}
                            placeholder="Enter your class feedback here! Try to mention helpful details like which professor taught the class or what semester you took it." />
                          <div ref="emptyMsg" className={err.textEmpty ? "" : "hidden"}>Please add text to your review!</div>
                          <div className={err.text && this.state.text != "" ? "" : "hidden"} id="errorMsg" >Your review contains illegal characters, please remove them.</div>
                        </div>
                        
                        <hr className="divider" />
                        <div className="row">
                            <div className="col-md-3 col-sm-3 col-xs-3">
                                <h1 className="secondary-text">Workload</h1>
                            </div>
                            <div className="col-md-1 col-sm-1 col-xs-1">
                                <div className="small-icon" id="sm1" style={this.getWorkColor(this.state.workload)}>
                                    <p>{this.state.workload}</p>
                                </div>
                            </div>
                            <div className="col-md-8 col-sm-8 col-xs-8 sliderHolder">
                               <input ref="workloadSlider" onChange={(event) => this.handleWorkChange(event)} type="range" id="a2" name="work" min="1" max="5" step="1" />
                            </div>
                        </div>
                        <div className="sm-spacing"></div>
                        <div className='row'>
                            <div className="col-md-3 col-sm-3 col-xs-3">
                                <h1 className="secondary-text">Difficulty</h1>
                            </div>
                            <div className="col-md-1 col-sm-1 col-xs-1">
                                <div className="small-icon" id="sm2" style={this.getDiffColor(this.state.diff)}>
                                    <p>{this.state.diff}</p>
                                </div>
                            </div>
                            <div className="col-md-8 col-sm-8 col-xs-8 sliderHolder">
                                <input ref="diffSlider" onChange={(event) => this.handleDiffChange(event)} type="range" id="a2" name="dff" min="1" max="5" step="1" />
                            </div>
                        </div>
                        <div className="sm-spacing"></div>
                        <div className="row">
                            <div className="col-md-3 col-sm-3 col-xs-3">
                                <div className="secondary-text">Median Grade</div>
                            </div>
                            <div className="col-md-6  col-sm-6 col-xs-6 selectAlignment">
                                <Select value={this.state.median} 
                                  onChange={(medianGrade) => this.handleMedianChange(medianGrade)}  
                                  options={this.getMedianOptions()} 
                                />
                                
                            </div>
                        </div>
                        <div className="sm-spacing"></div>
                        <div className="row">
                            <div className="col-md-3 col-sm-3 col-xs-3">
                                <div className="secondary-text">Professor</div>
                            </div>
                            <div className="col-md-8 col-sm-8 col-xs-8 selectAlignment">
                                <Select value={this.state.selectedProfessors} 
                                  onChange={(professors) => this.handleProfChange(professors)} 
                                  isMulti 
                                  options={this.getProfOptions()} 
                                />
                                <div ref="noProfMsg" className={err.professorsEmpty ? "" : "hidden"}>Please select the professor(s) you took this class with!</div>
                            </div>
                        </div>
                        <div className="sm-spacing"></div>
                        <div className="row">
                            <div className="col-md-12">
                                <h2 className="secondary-text">All posts are completely anonymous to ensure constructive, honest feedback. You must have previously been enrolled in this class to give feedback.</h2>
                            </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12 text-center">
                              <button disabled={!isEnabled} id = "postbutton" onClick={() => {this.setState({postClicks: this.state.postClicks +1});}}>Post</button>
                          </div>
                        </div>
                    </div>
                    
                
                <div className="row">
                    <div className="col-sm-12">
                        <h2 className="secondary-text">{this.state.message}</h2>
                    </div>
                </div>
            </form>
          </Rodal>
          
        </div>
    );
  }
}

// Form must be provided the course object of the class this review will be for.
Form.propTypes = {
  course: PropTypes.object.isRequired,
};

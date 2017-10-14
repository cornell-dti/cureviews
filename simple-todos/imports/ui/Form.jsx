import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/classes.js';

// Form component to allow user to add a review for selected course.
// Takes in a course ID.
export default class Form extends Component {
  constructor(props) {
    super(props);

    //store the currently selected form values
    this.state = {
      diff: 3, //default
      quality: 3, //default
      message: null
    }

    //bind the submission function to this class
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // handle a form submission. This will either add the review to the database
  // or return an error telling the user to try agian.
  handleSubmit(event) {
    event.preventDefault();

    //ensure all feilds are filled out
    const text = ReactDOM.findDOMNode(this.refs.reviewText).value.trim();
    const median = ReactDOM.findDOMNode(this.refs.median).value.trim();
    const atten = ReactDOM.findDOMNode(this.refs.atten).value.trim();
    if (text != null && median != null && atten != null) {
      console.log("got needed elements");

      // create new review object
      var newReview = {
        text: text,
        diff: this.state.diff,
        quality: this.state.quality,
        medGrade: median,
        atten: atten
      }

      //call the insert funtion
      Meteor.call('insert', newReview, this.props.courseId, (error, result) => {
        if (!error) {
          // Reset form
          ReactDOM.findDOMNode(this.refs.reviewText).value = '';
          ReactDOM.findDOMNode(this.refs.median).value = null;
          ReactDOM.findDOMNode(this.refs.atten).value = null;
          this.diff == 3;
          this.quality == 3;

          this.setState({message: "Thanks! Your review is pending approval."});
        } else {
          console.log(error)
          this.setState({message: "A error occured. Please try again."});
        }
      });
    }
  }

  handleQualChange(inputElement) {
    console.log(inputElement.value);
    //this.state.newReview.quality ==
  }
   
  render() {
    return (
      <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
        <div className = "panel panel-default">
          <div className="panel-body">
            <textarea type="text" ref="reviewText" placeholder="Does your professor tell funny jokes? Leave your feedback here!"/>
          </div>
        </div>
        <hr className="divider" />
        <div className="row">
      		<div className="col-md-3">
  				    <h1 className="secondary-text">Overall Quality</h1>
	  			</div>
	  			<div className="col-md-1">
	  				<div className="small-icon" id="sm1">
		  				<p>{this.state.quality}</p>
		  			</div>
	  			</div>
		  		<div className="col-md-8">
		  			<input type="range" id="a2" name="qual" min="0" max="5" step="1" />
		  		</div>
  			</div>
				<div className="sm-spacing"></div>
        <div className='row'>
          <div className="col-md-3">
              <h1 className="secondary-text">Level of Difficulty</h1>
          </div>
          <div className="col-md-1">
            <div className="small-icon" id="sm1">
              <p>{this.state.diff}</p>
            </div>
          </div>
          <div className="col-md-8">
            <input type="range" id="a2" name="qual" min="0" max="5" step="1" />
          </div>
        </div>
				<div className="sm-spacing"></div>

	  		<div className="row">
	  			<div className="col-md-4">
	  				<div className="secondary-text">Class Median</div>
	  			</div>
	  			<div className="col-md-8">
			  		<select ref='median'>
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
	  				<div className="secondary-text">Attendence</div>
	  			</div>
	  			<div className="col-md-8">
			    	<select ref='atten'>
			  			<option value="1">Not Mandatory</option>
			  			<option value="0">Mandatory</option>
			  		</select>
			  	</div>
	  		</div>

    	<div className="row">
    		<div className="col-md-10">
  				<h2 className="secondary-text" >All posts are completely anonymous to ensure constructive, honest feedback. You must have previously been enrolled in the className to give feedback</h2>
  			</div>
  			<div className="col-md-2">
  				<input type="submit" value="Post"/>
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

// export default createContainer(() => {
//   Meteor.subscribe('reviews');
//   return {
//     tasks: Reviews.find({}, { sort: { createdAt: -1 } }).fetch(),
//   };
// }, App);

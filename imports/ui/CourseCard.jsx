import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import Gauge from 'react-summary-gauge-2';
import { Reviews } from '../api/classes.js';
import './css/CourseCard.css';
import {lastOfferedSems, lastSem, getGaugeValues} from './js/CourseCard.js';

// Holder component to list all (or top) reviews for a course.
// Takes in course ID for selecting reviews.
export class CourseCard extends Component {
  //props:
  //course, the course for this card
  constructor(props) {
    super(props);

    //default gauge values
    this.defaultGaugeState = {
      diff: 0,
      diffColor: "#E64458",
      qual: 0,
      qualColor: "#E64458",
      grade: "-",
      gradeNum: 0,
      gradeColor: "#E64458",
      mandatory: "Mandatory",
    };

    this.state = this.defaultGaugeState;
  }

  componentWillReceiveProps(nextProps) {
    this.updateState(nextProps.course, nextProps.reviews);
  }

  //update the component state to represent new state of the gauges and the mandatory tag
  updateState(selectedClass, allReviews) {
    if (selectedClass !== null && selectedClass !== undefined) {
      //gather data on the reviews and set mandatory flags.
      if (allReviews.length !== 0) {
        //set the new state to the collected values. Calls getGaugeValues function in CourseCard.js
        this.setState(getGaugeValues(allReviews));
      } else {
        this.setState(this.defaultGaugeState); //default gauge values
      }
    }
    else {
      this.setState(this.defaultGaugeState); //default gauge values
    }
  }

  render() {
    var theClass = this.props.course;
    //Creates Url that points to each class page on Cornell Class Roster
    var url = "https://classes.cornell.edu/browse/roster/"
        + lastSem(theClass.classSems) + "/class/"
        + theClass.classSub.toUpperCase() + "/"
        + theClass.classNum;
    //Calls function in CourseCard.js that returns a clean version of the last semsters class was offered
    var offered = lastOfferedSems(theClass);
    return (
        <div id="coursedetails">
            <h1 className="subheader">{theClass.classSub.toUpperCase() + " " + theClass.classNum + ": " + theClass.classTitle}</h1>
            {/*Used to force new line */}
            <div>
              <a className="cornellClassLink spacing-large" href={url} target="_blank">classes.cornell.edu</a>
            </div>
            <p className="review-text spacing-large">
                <strong>Last Offered: </strong>
                {offered}
            </p>
            <h2>Class Data</h2>
            <div className= "panel panel-default">
                <div className = "panel-body">
                    <section>
                        <div className="row" id="gaugeHolder">
                            <div className="col-md-4 col-sm-4 col-xs-12">
                                <Gauge value={this.state.qual} width={160} height={120} color={this.state.qualColor} max={5} label="Quality" />
                            </div>
                            <div className="col-md-4 col-sm-4 col-xs-12">
                                <Gauge value={this.state.diff} width={160} height={120} color={this.state.diffColor} max={5} label="Difficulty"/>
                            </div>
                            <div className="col-md-4 col-sm-4 col-xs-12">
                                <Gauge value={this.state.gradeNum} width={160} height={120} color={this.state.gradeColor} max={9} label="Median Grade" textValue={this.state.grade}/>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <p className="review-text spacing-large">
              <strong>Attendance:</strong> {this.state.mandatory}
            </p>
        </div>
    );
  }
}

//define the props for this object
CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  reviews: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when database data changes!
export default createContainer((props) => {
  const subscription = Meteor.subscribe('reviews', props.course._id, 1, 0); //get only visible unreported reviews
  const loading = !subscription.ready();
  const reviews = Reviews.find({}).fetch();
  return {
    reviews, loading,
  };
}, CourseCard);

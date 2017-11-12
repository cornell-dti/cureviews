import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import Gauge from 'react-svg-gauge';
import { Reviews } from '../api/classes.js';
import './css/CourseCard.css';
import {lastOfferedSems, lastSem} from './js/CourseCard.js';

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
      mandatory: "Yes",
    };

    this.state = this.defaultGaugeState;
  }

  componentWillReceiveProps(nextProps) {
    // compare old and new reviews, if differnt re-calculate gauges
    //if (this.props.reviews != nextProps.reviews) {
   console.log(nextProps.reviews);
   this.updateState(nextProps.course, nextProps.reviews);
     //}
   }

  //update the component state to represent new state of the gagues and the mandatory tag
  updateState(selectedClass, newRevs) {
    console.log(selectedClass);
    if (selectedClass !== null && selectedClass !== undefined) {
      newState = {};
      //create initial variables
      var countGrade = 0;
      var countDiff = 0;
      var countQual = 0;
      var countMan = 0;
      var count = 0;

      //get all current reviews, which will now have only this class's reviews because of the updated publishing
      var allReviews = newRevs;

      //gather data on the reviews and the mandatory flags.
      if (allReviews.length != 0) {
        allReviews.forEach(function(review) {
          count++;
          countGrade = countGrade + Number(review["grade"]);
          countDiff = countDiff + review["difficulty"];
          countQual = countQual + review["quality"];
          countMan = countMan + review["atten"];
        });

        console.log("calculated qual is", (countQual/count).toFixed(1));
        console.log("calculated diff is ", (countDiff/count).toFixed(1));
        console.log("calculated grade is ", (countGrade/count).toFixed(1));

        //update the gauge variable values
        newState.qual = (countQual/count).toFixed(1); //out of 5
        newState.diff = (countDiff/count).toFixed(1); //out of 5
        newState.gradeNum = (countGrade/count).toFixed(1); //out of 5
        if ((countMan/count).toFixed(0) === 1) {
          newState.mandatory = "Yes";
        }  else {
          newState.mandatory = "No";
        }
        //array to translate grades from numerical value
        var gradeTranslation = ["C-", "C", "C+", "B-", "B", "B-", "A-", "A", "A+"];
        newState.grade = gradeTranslation[Math.floor(countGrade/count) - 1];

        //assign colors
        var gradeCols = ["#E64458", "#E64458", "#E64458", "#f9cc30", "#f9cc30", "#ff9e00","#53B277","#53B277","#53B277"];
        newState.gradeColor = gradeCols[Math.floor(newState.gradeNum) - 1];

        if (newState.qual < 2 ) {
          newState.qualColor = "#E64458";
        }
        else if (newState.qual > 2 && newState.qual < 3.5) {
          newState.qualColor = "#f9cc30";
        }
        else {
          newState.qualColor = "#53B277";
        }

        if (newState.diff < 2 ) {
          newState.diffColor = "#53B277";
        }
        else if (newState.diff > 2 && newState.diff < 3.5) {
          newState.diffColor = "#f9cc30";
        }
        else {
          newState.diffColor = "#E64458";
        }

        this.setState(newState);
      }
      else {
        console.log("first else");
        this.setState(this.defaultGaugeState);
      }
    }
    else {
      console.log("Second else");
      this.setState(this.defaultGaugeState);
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
      <header>
      <h1 className="subheader">{theClass.classSub.toUpperCase() + " " + theClass.classNum + ": " + theClass.classTitle}</h1>
      <a className="cornellClassLink spacing-large" href={url} target="_blank">cornell.classes.edu</a>
      <p className="review-text spacing-large">
        <strong>Last Offered: </strong>
        {offered}
      </p>
      {/* <p className="review-text spacing-large">
        <strong>Syllabus: </strong>
         <a className="cornellClassLink spacing-large" href={url} target="_blank">Download</a> (Placeholder)
      </p>*/}
      <h2>Class Data</h2>
        <div>
          <div className= "panel panel-default">
            <div className = "panel-body">
              <section>
                <div className="row" id="gaugeHolder">
                  <div className="col-sm-4">
                    <Gauge value={this.state.qual} width={160} height={120} color={this.state.qualColor} max={5} label="Quality" />
                  </div>
                  <div className="col-sm-4">
                    <Gauge value={this.state.diff} width={160} height={120} color={this.state.diffColor} max={5} label="Difficulty"/>
                  </div>
                  <div className="col-sm-4">
                    <Gauge value={this.state.gradeNum} width={160} height={120} color={this.state.gradeColor} max={9} label="Median Grade" textValue={this.state.grade}/>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <p className="review-text spacing-large">Attendence Mandatory: {this.state.mandatory}</p>
      </header>
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
  //console.log(reviews);
  return {
    reviews, loading,
  };
}, CourseCard);

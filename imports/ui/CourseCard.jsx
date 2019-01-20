import React, { Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import './css/CourseCard.css';
import {lastOfferedSems, lastSem, getGaugeValues} from './js/CourseCard.js';
import {Gauge} from 'gaugeJS';

/*
  Course Card Component.

  Container Component that returns a paenl of aggregated information about a class:
  Displays:
    - course title
    - link to course roster
    - gauges for quality, difficulty and estimated median
    - semsters last offered
    - attendance requirement
*/

export class CourseCard extends Component {
  constructor(props) {
    super(props);

    // default gauge values
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

    // initialize state as default gauge values
    this.state = this.defaultGaugeState;
  }

  // Whenever the incoming props change (i.e, the database of reviews for a class
  // is updated) trigger a re-render by updating the gauge values in the local state.
  componentWillReceiveProps(nextProps) {
    this.updateState(nextProps.course, nextProps.reviews);
  }

  // Recalculate gauge values and other metrics to update the local state
  updateState(selectedClass, allReviews) {
    if (selectedClass !== null && selectedClass !== undefined) {
      // gather data on the reviews and set mandatory flags.
      if (allReviews.length !== 0) {
        // set the new state to the collected values. Calls getGaugeValues function in CourseCard.js
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

    // Creates Url that points to each class page on Cornell Class Roster
    var url = "https://classes.cornell.edu/browse/roster/"
        + lastSem(theClass.classSems) + "/class/"
        + theClass.classSub.toUpperCase() + "/"
        + theClass.classNum;

    // Calls function in CourseCard.js that returns a clean version of the last semster class was offered
    var offered = lastOfferedSems(theClass);

    var GaugeWrapper = React.createClass({
      componentDidMount(){
        var overallOpts = {
          lines: 12,
          angle: 0.15,
          lineWidth: 0.44,
          pointer: {
            length: 0.9,
            strokeWidth: 0.035,
            color: '#000000'
          },
          limitMax: 'false',
          percentColors: [[0.0, "#53b227" ], [.33, "#f8cc30"], [.66, "#e64558"]],
          strokeColor: '#E0E0E0',
          generateGradient: true
        };
        var difWorkOpts = Object.assign({}, overallOpts);
        difWorkOpts.percentColors = [[0.0, "#e64558" ], [.33, "#f8cc30"], [.66, "#53b227"]];
        // Overall Rating
        var target = ReactDOM.findDOMNode(this.refs.foo);
        var gauge = new Gauge(target).setOptions(overallOpts);
        gauge.maxValue = this.props.max;
        gauge.set(this.state.qual);

        // Difficulty
        var target2 = ReactDOM.findDOMNode(this.refs.goo);
        var gauge2 = new Gauge(target2).setOptions(difWorkOpts);
        gauge2.maxValue = this.props.max;
        gauge2.set(this.state.diffColor);

        // WorkLoad
        var target2 = ReactDOM.findDOMNode(this.refs.hoo);
        var gauge2 = new Gauge(target2).setOptions(difWorkOpts);
        gauge2.maxValue = this.props.max;
        gauge2.set(this.state.gradeNum);
      },
      render(){
        return (
          <div className="row">
            <div className="col-md-4 col-sm-4">
              {this.state.qual}
              <canvas ref="foo" width={this.props.width} height={this.props.height} />
              Overall Rating
            </div>
            <div className="col-md-4 col-sm-4">
              {this.state.diffColor}
              <canvas ref="goo" width={this.props.width} height={this.props.height} />
              Difficulty
            </div>
            <div className="col-md-4 col-sm-4">
              {this.state.gradeNum}
              <canvas ref="hoo" width={this.props.width} height={this.props.height} />
              WorkLoad
            </div>
          </div>
        );
      }
    });

    return (
        <div id="coursedetails">
            <h1 className="subheader top-margin">
              <strong> {theClass.classSub.toUpperCase() + " " + theClass.classNum
              + ": " + theClass.classTitle}
              </strong>
            </h1>
            <div href={url} target="_blank"> {/* Forces link onto next line */}
              <a className="cornellClassLink" href={url}>Course Roster</a>
            </div>
            <p className="review-text spacing-large top-margin">
                <strong>Offered: </strong>
                {offered}
            </p>
            <p className="review-text spacing-large top-margin-small">
                <strong>Median Grade: </strong>
                {this.state.grade}
            </p>
            <div className= "panel panel-default top-margin-medium">
                <div className = "panel-body">
                    <section>
                        <div className="row " id="gaugeHolder">
                            <div className="col-md-12 col-sm-12 col-xs-12" id="qualGauge">
                                <GaugeWrapper width="200" options={{}} max="200" value="50"/>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
  }
}

// Component requires course information and all reviews for the course.
// Parent class provides the course's database object, while withTracker
// grabs this course's reviews.
CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  reviews: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab reviews.
// The component will automatically re-render if the reviews change.
export default withTracker(props => {
  const subscription = Meteor.subscribe('reviews', props.course._id, 1, 0); //get only visible unreported reviews
  const loading = !subscription.ready();
  const reviews = Reviews.find({}).fetch();
  return {
    reviews, loading,
  };
}) (CourseCard);

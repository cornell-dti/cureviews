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
        //Notice these are found by their refs not by ID
        var target = ReactDOM.findDOMNode(this.refs.foo);
        var gauge = new Gauge(target).setOptions(this.props.options);
        gauge.maxValue = this.props.max;
        gauge.set(this.props.value);
        
        //Notice these are found by their refs not by ID
        var target2 = ReactDOM.findDOMNode(this.refs.poo);
        var gauge2 = new Gauge(target2).setOptions(this.props.options);
        gauge2.maxValue = this.props.max;
        gauge2.set(this.props.value);
        
      },
      render(){
        return (
          // Created a component 'GaugeWrapper' that returns 2 gauges but you can add as many as you sendFeedback
          // You just need to reference them all by different names 'target', 'target2', etc.
          //Notice they are called by 'ref', not by ID
          <div className="row">
            <div className="col-md-6 col-sm-6">
              <canvas ref="foo" width={this.props.width} height={this.props.height} />
            </div>
            <div className="col-md-6 col-sm-6">
              <canvas ref="poo" width={this.props.width} height={this.props.height} />
            </div>
          </div>
          
        );
        
      }
    });


    // /*var target = this.refs.test;
    //     var gauge = Gauge.Gauge(target);*/



    /*
    var target = this.refs.test; // your canvas element
    var gauge =  new Gauge(target).setOptions(opts); // create sexy gauge!

    var target = this.refs.test;
    var gauge = Gauge.Gauge(target);*/

    /*
    var target = document.getElementById('foo'); // your canvas element
    var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
    gauge.maxValue = 3000; // set max gauge value
    gauge.setMinValue(0);  // set min value
    gauge.set(1250); // set actual value
    */

    return (
        <div id="coursedetails">
            <div id="numBox" className="courseNum">{theClass.classSub.toUpperCase() + " " + theClass.classNum}</div>
            <h1 className="subheader">{theClass.classTitle}</h1>
            <div id="box" className="cornellClassLink spacing-large top-margin-small" href={url} target="_blank"> {/* Forces link onto next line */}
              <a href={url}>classes.cornell.edu</a>
            </div>
            <p className="review-text spacing-large top-margin-small">
                <strong>Last Offered: </strong>
                {offered}
            </p>
            <div className= "panel panel-default top-margin">
                <div className = "panel-body">
                    <section>
                        <div className="row " id="gaugeHolder">
                            <div className="col-md-12 col-sm-12 col-xs-12" id="qualGauge">
                                <GaugeWrapper width="500" options={{}} max="500" value="50"/>
                            </div>
                            
                        </div>
                        {/*
                        <div className="row " id="gaugeHolder">
                            <div className="col-md-6 col-sm-6 col-xs-12">
                            </div>
                            <div className="col-md-6 col-sm-6 col-xs-12">
                            yo
                            </div>
                        </div>
                        */}
                    </section>
                </div>
            </div>

            <div className = "top-margin-small">
              <div id="enrollBox"> {/*try disabled button also change fonts back, use chrome in editor thing*/}
                <text className="overall-rank"> Enroll with Caution</text>
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/Review.css';

/*
  Review Component.

  Simple styling component that renders a single review (an li element)
  to show in a ClassView. These reivews will include:
   - how long ago the reivew was added
   - all review content
   - report button
*/

export default class Review extends Component {

  // Function to convert the classId assigned to this review into the
  // full, human-readable name of the class.
  renderClassName(classId) {
    var toShow = ''; //empty div
    return Meteor.call('getCourseById', classId, (error, result) => {
      if (!error) {
        toShow = result.classTitle;
        return result.classTitle;
      } else {
        console.log(error);
      }
    });
    return toShow;
  }

  //get color for quality value
  // Function to get the color of the quality color box based on the quality value.
  getQualColor(value) {
    var colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value],
    };
  }

  // Function to get the color of the difficulty color box based on the diffiiculty value.
  getDiffColor(value) {
    var colors = ["#53B277", "#53B277", "#f9cc30", "#f9cc30", "#E64458", "#E64458"];
    return {
      backgroundColor: colors[value],
    };
  }

  render() {
    var review = this.props.info;
    var classId = review.class;
    return (
      <li>
        <div className="row">
          <div className="col-sm-12">
            <p className="classNameLink">
              <i>{moment(review.date.toISOString()).fromNow()}</i>
            </p>
          </div>
        </div>
        <div className="review">
          <div className="panel-body-3">
            <div className="row reviewNumbers">
              <div className="col-md-2 col-xs-2 col-xs-2">
                <div className="container" id="box" style={this.getQualColor(review.quality)}>
                  <div id="text">{review.quality}</div>
                </div>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" id="labelName">
                <p id="labelName">Workload</p>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" >
                <div className="container" id="box" style={this.getDiffColor(review.difficulty)}>
                  <div id="text">{review.difficulty}</div>
                </div>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" id="labelName">
                <p id="labelName">Difficulty</p>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" id="labelName">
                <p id="labelName">Recommendability</p>
              </div>
            </div>
            <div className="row reviewNumbers">
              <div className="col-md-3 col-sm-3 col-xs-3" id="labelName">
                <p id="profLabel">Professor: </p>
              </div>
              <div className="col-md-4 col-sm-4 col-xs-4" id="labelName" >
                <div className="container" id="prof_box">
                  <div id="professor_text">Michael Clarkson</div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="review-text" id="review_text">{review.text}</div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <p id="button_text">I agree</p>
              </div>
            </div>
            <div className="col-sm-12">
              <button type="button" className="btn btn-circle btn-primary"><i id="agreeNumber">1</i>
              </button>
              {/* <button onClick={() => { this.props.reportHandler(review); alert('This post has been reported and will be reviewed.'); }} id="button_text">Report</button> */}
            </div>
          </div>
        </div>
      </li>
    );
  }
}

// takes in the database object representing this review
Review.propTypes = {
  info: PropTypes.object.isRequired
};

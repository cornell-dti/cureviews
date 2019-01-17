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
   - like button
*/

export default class Review extends Component {
  constructor(props) {
    super(props);


    this.state = {
      liked: false, //indicates whether or not the review has been liked in the current state
    }


  }

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

  // Function that checks whether or not the review has already been liked
  // in the current state. If so, the number of likes decreases by 1 as if removing a like.
  // Otherwise, the number of likes increases by 1.
  increment(review) {
    if (this.state.liked == false) {
      return Meteor.call('incrementLike', review, (error, result) => {
        if (!error && result === 1) {
          this.setState({
            liked: true,
          })
          console.log(this.state.liked);
          console.log("Likes: " + review.likes);
        } else {
          console.log(error)
        }
      });
    }
    else {
      return Meteor.call('decrementLike', review, (error, result) => {
        if (!error && result === 1) {
          this.setState({
            liked: false,
          })
          console.log("Likes: " + review.likes);
        } else {
          console.log(error)
        }
      });
    }

  }

  render() {
    var review = this.props.info;
    var classId = review.class;
    return (
      <li>
        <div className="review">
          <div className="col-sm-12">
            <button className="report-review" onClick={() => {
              this.props.reportHandler(review);
              alert('This post has been reported and will be reviewed.');
            }}>
              <span className="glyphicon glyphicon-flag"
              ></span>
            </button>
          </div>
          <div className="panel-body-3">
            <div className="row reviewNumbers">
              <div className="col-md-2 col-xs-2 col-xs-2" id="circle">
                <div className="container" id="circlebox" style={this.getQualColor(review.quality)}>
                  <div id="text">{review.quality}</div>
                </div>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" id="label-wrap">
                <p id="labelName">Overall Rating</p>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" id="circle">
                <div className="container" id="circlebox" style={this.getDiffColor(review.difficulty)}>
                  <div id="text">{review.difficulty}</div>
                </div>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" id="label-wrap">
                <p id="labelName">Difficulty</p>
              </div>
              <div className="col-md-2 col-xs-2 col-xs-2" id="circle">
                <div className="container" id="circlebox" style={this.getQualColor(review.quality)}>
                  <div id="text">{review.quality}</div>
                </div>
              </div>
              <div className="col-md-2 col-sm-2 col-xs-2" id="label-wrap">
                <p id="labelName">Workload</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-3 col-sm-3 col-xs-3">
                <p id="profLabel">Professor: </p>
              </div>
              <div className="col-md-4 col-sm-4 col-xs-4">
                <p id="professor_text">Michael Clarkson</p>
              </div>
            </div>
            <div className="row">
              <div className="review-text" id="review_text">{review.text}</div>
            </div>
            <div className="row">
              <div className="col-sm-3">
                <p id="review-date"><i>{moment(review.date.toISOString()).fromNow()}</i></p>
              </div>
              <div className="col-sm-9">
                <button className= //if the review has been liked, the button will be filled in.
                  {(this.state.liked == false ? "upvote btn-lg" : "voted btn-lg")}
                  onClick={() => {
                    this.increment(review);
                  }}>
                  <span className="glyphicon glyphicon-thumbs-up"></span>
                </button>
              </div>
            </div>
            <div className="row">
              <p id="upvote-text">Helpful
              ({(review.likes == undefined ? 0 : review.likes)})</p>
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

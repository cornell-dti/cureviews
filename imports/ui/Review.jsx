import React, { Component } from 'react';
import moment from 'moment';
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
      numLikes: this.props.likes //the number of likes on the PreviewCard review
    }

    this.circlebox_class = props.isPreview ? "circlebox-preview" : "circlebox";
    this.review_number_text_class = props.isPreview ? "review-number-text-preview" : "review-number-text";
    this.review_number_label_class = props.isPreview ? "review-number-label-preview" : "review-number-label";
    this.professor_title_class = props.isPreview ? "professor-title-preview" : "professor-title";
    this.review_text_class = props.isPreview ? "review-text-preview" : "review-text";
    this.professor_text_class = props.isPreview ? "professor-text-preview" : "professor-text";

  }

  // Function to convert the classId assigned to this review into the
  // full, human-readable name of the class.
  renderClassName(classId) {
    return Meteor.call('getCourseById', classId, (error, result) => {
      if (!error) {
        return result.classTitle;
      } else {
        console.log(error);
      }
    });
  }

  // Convert the reviews's value to a color starting with red and ending with green.
  getColorRedToGreen(value) {
    const colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value]
    }
  }

  // Convert the reviews's value to a color starting with green and ending with red.
  getColorGreenToRed(value) {
    const colors = ["#53B277", "#53B277", "#f9cc30", "#f9cc30", "#E64458", "#E64458"];
    if (value == undefined) return { backgroundColor: "#a9a9a9" }
    else return {
      backgroundColor: colors[value],
    }
  }

  // Function that checks whether or not the review has already been liked
  // in the current state. If so, the number of likes decreases by 1 as if removing a like.
  // Otherwise, the number of likes increases by 1.
  increment(review) {
    console.log("here");
    if (this.state.liked == false) {
      return Meteor.call('incrementLike', review._id, (error, result) => {
        if (!error && result === 1) {
          this.setState({
            liked: true,
            numLikes: this.state.numLikes + 1 //updates the likes on the PreviewCard review in realtime
          })
          console.log(this.state.liked);
          console.log("Likes: " + review.likes);
        } else {
          console.log(error)
        }
      });
    }
    else {
      return Meteor.call('decrementLike', review._id, (error, result) => {
        if (!error && result === 1) {
          this.setState({
            liked: false,
            numLikes: this.state.numLikes - 1
          })
          console.log("Likes: " + review.likes);
        } else {
          console.log(error)
        }
      });
    }
  }

  reviewToSemester(review) {
    let semester = ""
    // Get last 2 digits of review year
    let review_year = String(moment(review.date.toISOString()).year()).substring(2);
    let review_month = moment(review.date.toISOString()).month() + 1;
    if (review_month >= 1 && review_month <= 5) {
      semester = "SP"
    }
    else if (review_month >= 6 && review_month <= 8) {
      semester = "SU"
    }
    else {
      semester = "FA"
    }
    return semester + review_year;
  }

  render() {
    const review = this.props.info;
    console.log("prop" + this.props.likes);
    // console.log(review);
    // console.log(review.rating);
    return (
      <div className="review">
        {
          !this.props.isPreview && 
          <div className="row noLeftRightSpacing">
            <div className="col-md-12 col-xs-12 col-xs-12">
              <button className="report-review" onClick={() => {
                this.props.reportHandler(review);
                alert('This post has been reported and will be reviewed.');
              }}>
                <span className="glyphicon glyphicon-flag"
                ></span>
              </button>
            </div>
          </div>
        }
        <div className="panel-body-3">
          <div className="row reviewNumbers noLeftRightSpacing">

            <div className="container" id={this.circlebox_class} style={this.getColorRedToGreen((review.rating != undefined) ? review.rating : review.quality)}>
              <p className={this.review_number_text_class} >{(review.rating != undefined) ? review.rating : review.quality}</p>

            </div>

            <p className={this.review_number_label_class}>Overall Rating</p>


            <div className="container" id={this.circlebox_class} style={this.getColorGreenToRed(review.difficulty)}>
              <p className={this.review_number_text_class} >{review.difficulty}</p>
            </div>


            <p className={this.review_number_label_class}>Difficulty</p>


            <div className="container" id={this.circlebox_class} style={this.getColorGreenToRed(review.workload)}>
              <p className={this.review_number_text_class} >{(review.workload) ? review.workload : "-"}</p>
            </div>


            <p className={this.review_number_label_class}>Workload</p>

          </div>
          <div className="row noLeftRightSpacing">
            <div className="col-md-2 col-sm-2 col-xs-2 noLeftRightSpacing review-padding-left">
              <p className={this.professor_title_class}>Professor: </p>
            </div>
            <div className="col-md-10 col-sm-10 col-xs-10">
              {/*The following adds a grey professor box for each professor listed in the review*/}
              {(review.professors && review.professors.length !== 0) ? review.professors.map((prof, index) => (<div key={index} className="col-md-12 col-sm-12 col-xs-12">
                <p className={this.professor_text_class}>{prof}</p></div>)) : <div className="col-md-12 col-sm-12 col-xs-12">
                  <p className={this.professor_text_class}>N/A</p></div>}
            </div>
          </div>
          <div className="row noLeftRightSpacing review-padding-left">
            <div className={this.review_text_class} >
              <span className={this.props.isPreview ? "preview-review-overflow" : ""}>
                {review.text}
              </span>
            </div>
          </div>
        </div>
        <div className="row noLeftRightSpacing">
          <div className="col-md-3 col-sm-3 col-xs-3 noLeftRightSpacing">
            <p className="review-date"><i>{this.reviewToSemester(review)}</i></p>
          </div>
          <div className="col-md-9 col-sm-9 col-xs-9">
            <button className= //if the review has been liked, the button will be filled in.
              {(this.state.liked == false ? "upvote btn-lg" : "voted btn-lg")}
              onClick={() => {
                this.increment(review);
              }}>
              <span className="glyphicon glyphicon-thumbs-up"></span>
            </button>
          </div>
        </div>
        <div className="row noLeftRightSpacing">
          <p className="upvote-text">Helpful
          ({(this.props.isPreview ? this.state.numLikes : ((review.likes == undefined) ? 0 : review.likes))})</p>
        </div>
      </div>
    );
  }
}


// takes in the database object representing this review
Review.propTypes = {
  info: PropTypes.object.isRequired,
  reportHandler: PropTypes.func,
  isPreview: PropTypes.bool.isRequired,
  likes: PropTypes.number
};

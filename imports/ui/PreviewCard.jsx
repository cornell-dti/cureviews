import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/PreviewCard.css';
import Gauge from './Gauge.jsx';
import Review from './Review.jsx';

/*
  Preview Card component.

  Props: course - course object used to render a preview card for ResultsDisplay
                  to use.
*/

export default class PreviewCard extends Component {
  constructor(props) {
    super(props);
    // set gauge values
    this.state = {
      id: this.props.course._id,
      rating: this.props.course.classRating,
      ratingColor: "E64458",
      diff: this.props.course.classDifficulty,
      diffColor: "E64458",
      workload: this.props.course.classWorkload,
      workloadColor: "E64458",
      topReview: {},
      numReviews: 0,
      topReviewLikes: 0,
    };

    this.updateColors = this.updateColors.bind(this);
    this.updateTopReview = this.updateTopReview.bind(this);
    this.updateGauges = this.updateGauges.bind(this);
    console.log("props",this.props);
    console.log("state",this.state);
  }

  componentDidMount() {
    this.updateGauges();
  }

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this.updateGauges();
    }
  }

  //If the value of the metric is null, set the Gauge value to "-"
  updateGauges() {
    this.setState({
      id: this.props.course._id,
      rating: Number(this.props.course.classRating) ? this.props.course.classRating : "-",
      diff: Number(this.props.course.classDifficulty) ? this.props.course.classDifficulty : "-",
      workload: Number(this.props.course.classWorkload) ? this.props.course.classWorkload : "-",
    }, () => this.updateColors());
  }

  //Updates the top review to be the one with the most likes
  updateTopReview() {
    Meteor.call("getReviewsByCourseId", this.props.course._id, (err, reviews) => {
      if (!err && reviews) {
        // Sort reviews according to most likes
        if (reviews.length > 0) {
          reviews.sort((a, b) => (((a.likes) ? a.likes : 0) < ((b.likes) ? b.likes : 0)) ? 1 : -1)
          this.setState({
            topReview: reviews[0],
            topReviewLikes: reviews[0].likes ? reviews[0].likes : 0,  //Account for undefined likes in review obj
            numReviews: reviews.length
          });
        }
        else {
          this.setState({
            topReview: {},
            numReviews: 0
          });
          console.log("no prof reviews");
        }

      }
      else {
        console.log("Error in retriving reviews.");
      }
    });
  }

  //Updates the colors of the metrics
  updateColors() {
    if (3.0 <= this.state.rating && this.state.rating < 4.0) {
      this.setState({
        ratingColor: "#f9cc30"
      })
    }
    else if (4.0 <= this.state.rating && this.state.rating <= 5.0) {
      this.setState({
        ratingColor: "#53B277"
      })
    }
    else {
      this.setState({
        ratingColor: "#E64458"
      })
    }

    if (0 < this.state.diff && this.state.diff < 3.0) {
      this.setState({
        diffColor: "#53B277"
      })
    }
    else if (3.0 <= this.state.diff && this.state.diff < 4.0) {
      this.setState({
        diffColor: "#f9cc30"
      })
    }
    else {
      this.setState({
        diffColor: "#E64458"
      })
    }

    if (0 < this.state.workload && this.state.workload < 3.0) {
      this.setState({
        workloadColor: "#53B277"
      })
    }
    else if (3.0 <= this.state.workload && this.state.workload < 4.0) {
      this.setState({
        workloadColor: "#f9cc30"
      })
    }
    else {
      this.setState({
        workloadColor: "#E64458"
      })
    }
    this.updateTopReview();
  }

  render() {
    let theClass = this.props.course;
    console.log("likes:" + this.state.topReviewLikes);
    console.log(theClass);
    console.log("props",this.props);

    return (
      <div className="preview-holder">
        <div className="preview-panel">
          <div className="row">
            <div className="col-md-12 col-sm-12">
                <p className="preview-class-title">
                <a className="preview-class-link" href={`/course/${theClass.classSub.toUpperCase()}/${theClass.classNum}`}>
                  {theClass.classTitle}
                </a>
              </p>
              <p className="preview-class-info">
                {theClass.classSub.toUpperCase() + " " + theClass.classNum}
              </p>
            </div>
          </div>
          <div className="row gaugeHolder">

            <div className="col-md-4 col-sm-4 col-xs-12 remove-left-padding">
              <Gauge width="16vw" height="16vh" rating={parseFloat(this.state.rating)} text="Overall"/>

            </div>
            <div className="col-md-4 col-sm-4 col-xs-12 remove-left-padding">
              <Gauge width="16vw" height="16vh" rating={parseFloat(this.state.diff)} text="Difficulty"/>

            </div>
            <div className="col-md-4 col-sm-4 col-xs-12 remove-left-padding">
              <Gauge width="16vw" height="16vh" rating={parseFloat(this.state.workload)} text="Workload"/>

            </div>

          </div>
          <div className="row">
            <div className="col-md-12 col-sm-12 remove-left-padding">
              {Object.keys(this.state.topReview).length !== 0 &&

                <p className="preview-top-review-label">Top Review</p>

              }
            </div>
          </div>
          <div className="row">
            <div className="review-holder">
              {/*If class has review show top review and link*/}
              {Object.keys(this.state.topReview).length !== 0 &&

                <Review key={this.state.topReview._id} info={this.state.topReview} isPreview={true} likes={this.state.topReviewLikes} />

              }

              {
                Object.keys(this.state.topReview).length !== 0
                &&
                <a className="col-md-12 preview-review-button" href={`/course/${theClass.classSub.toUpperCase()}/${theClass.classNum}`}>
                  See {this.state.numReviews} more review{this.state.numReviews > 1 ? "s" : ""}
                </a>
              }

              {/*If class has 0 reviews text and button*/}
              {
                Object.keys(this.state.topReview).length === 0
                &&
                <p className="preview-empty-top-review">
                  No reviews yet
                </p>
              }
              {
                Object.keys(this.state.topReview).length === 0
                &&
                <a className="col-md-12 col-sm-12 preview-review-button"
                  href={`/course/${theClass.classSub.toUpperCase()}/${theClass.classNum}`}>
                  Leave a review
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    );

  }
}


// takes in the database object representing this review
PreviewCard.propTypes = {
  course: PropTypes.object.isRequired
};

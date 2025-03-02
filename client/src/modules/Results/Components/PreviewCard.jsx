import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { lastOfferedSems } from 'common/CourseCard';

import Gauges from '../../Course/Components/Gauges';
import ReviewCard from '../../Course/Components/ReviewCard';

import styles from '../Styles/CoursePreview.module.css';
const Review = ReviewCard;

/*
  Preview Card component.

  Props: course - course object used to render a preview card for ResultsDisplay
                  to use.
*/

export default class PreviewCard extends Component {
  constructor(props) {
    super(props);
    // Set gauge values
    this.state = {
      id: this.props.course._id,
      rating: this.props.course.classRating,
      ratingColor: 'E64458',
      diff: this.props.course.classDifficulty,
      diffColor: 'E64458',
      workload: this.props.course.classWorkload,
      workloadColor: 'E64458',
      topReview: {},
      numReviews: 0,
      topReviewLikes: 0
    };

    this.updateTopReview = this.updateTopReview.bind(this);
    this.updateGauges = this.updateGauges.bind(this);
  }

  componentDidMount() {
    this.updateGauges();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.updateGauges();
    }
  }

  // If the value of the metric is null, set the Gauge value to "-"
  updateGauges() {
    this.setState({
      id: this.props.course._id,
      rating: Number(this.props.course.classRating)
        ? this.props.course.classRating
        : '-',
      diff: Number(this.props.course.classDifficulty)
        ? this.props.course.classDifficulty
        : '-',
      workload: Number(this.props.course.classWorkload)
        ? this.props.course.classWorkload
        : '-'
    });
    this.updateTopReview();
  }

  // Updates the top review to be the one with the most likes
  updateTopReview() {
    axios
      .post(`/api/courses/get-reviews`, {
        courseId: this.props.course._id
      })
      .then((response) => {
        const reviews = response.data.result;
        if (reviews) {
          if (reviews.length > 0) {
            reviews.sort((a, b) =>
              (a.likes ? a.likes : 0) < (b.likes ? b.likes : 0) ? 1 : -1
            );
            this.setState({
              topReview: reviews[0],
              topReviewLikes: reviews[0].likes ? reviews[0].likes : 0, //Account for undefined likes in review obj
              numReviews: reviews.length
            });
          } else {
            this.setState({
              topReview: {},
              numReviews: 0
            });
          }
        }
      });
  }

  render() {
    let theClass = this.props.course;
    const offered = lastOfferedSems(theClass);
    return (
      <div className="">
        <div className="">
          <div className={styles.coursetitle}>
            <a
              href={`/course/${theClass.classSub.toUpperCase()}/${
                theClass.classNum
              }`}
            >
              {theClass.classTitle}
            </a>
          </div>
          <div className={styles.subtitle}>
            {theClass.classSub.toUpperCase() +
              ' ' +
              theClass.classNum +
              ', ' +
              offered}
          </div>
        </div>

        <Gauges
          overall={parseFloat(this.state.rating)}
          difficulty={parseFloat(this.state.diff)}
          workload={parseFloat(this.state.workload)}
        />

        {this.state.numReviews !== 0 && (
          <div className={styles.topreview}>Top Review</div>
        )}

        <div className={styles.columns}>
          {/*If class has review show top review and link*/}
          {this.state.numReviews !== 0 && (
            <Review
              key={this.state.topReview._id}
              review={this.state.topReview}
              reportHandler={this.reportHandler}
              isPreview={true}
              isProfile={false}
            />
          )}

          {this.state.numReviews !== 0 && this.state.numReviews > 1 && (
            <a
              className={styles.reviewsbutton}
              href={`/course/${theClass.classSub.toUpperCase()}/${
                theClass.classNum
              }`}
            >
              See {this.state.numReviews} more review
              {this.state.numReviews > 1 ? 's' : ''}
            </a>
          )}

          {/*If class has 0 reviews text and button*/}
          {this.state.numReviews === 0 && (
            <div className={styles.noreviews}>No reviews yet</div>
          )}
          {(this.state.numReviews === 0 || this.state.numReviews === 1) && (
            <a
              className={styles.reviewsbutton}
              href={`/course/${theClass.classSub.toUpperCase()}/${
                theClass.classNum
              }`}
            >
              Leave a Review
            </a>
          )}
        </div>
      </div>
    );
  }
}

// takes in the database object representing this review
PreviewCard.propTypes = {
  course: PropTypes.object.isRequired
};

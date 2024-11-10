import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { lastOfferedSems } from 'common/CourseCard'

import Gauge from '../../Course/Components/Gauge'
import ReviewCard from '../../Course/Components/ReviewCard'

import styles from '../Styles/CoursePreview.module.css'
const Review = ReviewCard

/*
  Preview Card component.

  Props: course - course object used to render a preview card for ResultsDisplay
                  to use.
*/

export default class PreviewCard extends Component {
  constructor(props) {
    super(props)
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
      topReviewLikes: 0,
    }

    this.updateColors = this.updateColors.bind(this)
    this.updateTopReview = this.updateTopReview.bind(this)
    this.updateGauges = this.updateGauges.bind(this)
  }

  componentDidMount() {
    this.updateGauges()
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.updateGauges()
    }
  }

  // If the value of the metric is null, set the Gauge value to "-"
  updateGauges() {
    this.setState(
      {
        id: this.props.course._id,
        rating: Number(this.props.course.classRating)
          ? this.props.course.classRating
          : '-',
        diff: Number(this.props.course.classDifficulty)
          ? this.props.course.classDifficulty
          : '-',
        workload: Number(this.props.course.classWorkload)
          ? this.props.course.classWorkload
          : '-',
      },
      () => this.updateColors()
    )
  }

  // Updates the top review to be the one with the most likes
  updateTopReview() {
    axios
      .post(`/api/courses/get-reviews`, { courseId: this.props.course._id })
      .then((response) => {
        const reviews = response.data.result
        if (reviews) {
          if (reviews.length > 0) {
            reviews.sort((a, b) =>
              (a.likes ? a.likes : 0) < (b.likes ? b.likes : 0) ? 1 : -1
            )
            this.setState({
              topReview: reviews[0],
              topReviewLikes: reviews[0].likes ? reviews[0].likes : 0, //Account for undefined likes in review obj
              numReviews: reviews.length,
            })
          } else {
            this.setState({
              topReview: {},
              numReviews: 0,
            })
          }
        }
      })
  }

  // Updates the colors of the metrics
  updateColors() {
    if (3.0 <= this.state.rating && this.state.rating < 4.0) {
      this.setState({
        ratingColor: '#f9cc30',
      })
    } else if (4.0 <= this.state.rating && this.state.rating <= 5.0) {
      this.setState({
        ratingColor: '#53B277',
      })
    } else {
      this.setState({
        ratingColor: '#E64458',
      })
    }

    if (0 < this.state.diff && this.state.diff < 3.0) {
      this.setState({
        diffColor: '#53B277',
      })
    } else if (3.0 <= this.state.diff && this.state.diff < 4.0) {
      this.setState({
        diffColor: '#f9cc30',
      })
    } else {
      this.setState({
        diffColor: '#E64458',
      })
    }

    if (0 < this.state.workload && this.state.workload < 3.0) {
      this.setState({
        workloadColor: '#53B277',
      })
    } else if (3.0 <= this.state.workload && this.state.workload < 4.0) {
      this.setState({
        workloadColor: '#f9cc30',
      })
    } else {
      this.setState({
        workloadColor: '#E64458',
      })
    }
    this.updateTopReview()
  }

  render() {
    let theClass = this.props.course
    const offered = lastOfferedSems(theClass)
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

        {!this.props.transformGauges && (
          <div className={styles.gauges}>
            <Gauge
              rating={parseFloat(this.state.rating)}
              label="Overall"
              isOverall={true}
            />
            <Gauge
              rating={parseFloat(this.state.diff)}
              label="Difficulty"
              isOverall={false}
            />
            <Gauge
              rating={parseFloat(this.state.workload)}
              label="Workload"
              isOverall={false}
            />
          </div>
        )}

        {this.state.numReviews !== 0 && (
          <div className={styles.topreview}>Top Review</div>
        )}

        {!this.props.transformGauges && (
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
        )}
      </div>
    )
  }
}

// takes in the database object representing this review
PreviewCard.propTypes = {
  course: PropTypes.object.isRequired,
}

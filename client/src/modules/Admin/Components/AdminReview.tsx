import React, { Component } from 'react'
import axios from 'axios'

import styles from '../Styles/AdminReview.module.css'

type Props = {
  info: any
  approveHandler: (arg1: any) => any
  removeHandler: (arg1: any, arg2: any) => any

  //was origially optional
  unReportHandler: (arg1: any) => any
}

type State = {
  shortName: string
  longName: string
}

/*
  Update Review Component.

  Simple styling component that renders a single review (an li element)
  to show on the Admin interface. Admin-visible reviews will be of 2 types:
  - Unapproved: new reviews needing approval
  - Reported: reviews that have been reprot and need review.

  Unapproved Reivews will contain:
  -  Name of the course the review belongs to
   - how long ago the review was added
   - all review content
   - button to approve the review
   - button to delete the review

  Reported Reviews will contain:
   -  Name of the course the review belongs to
    - how long ago the review was added
    - all review content
    - button to un-report (restore) the review
    - button to delete the review
*/

export default class UpdateReview extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    // state of app will contain details about the class this reivew is for
    this.state = {
      shortName: '',
      longName: '',
    }

    axios
      .post(`/api/getCourseById`, {
        courseId: props.info.class,
      })
      .then((response) => {
        const course = response.data.result
        if (course) {
          this.setState({
            shortName: course.classSub.toUpperCase() + ' ' + course.classNum,
            longName: course.classTitle,
          })
        } else {
          // eslint-disable-next-line no-console
          console.log(`Unable to find course by id = ${props.info.class}`)
        }
      })
  }

  // Decide which buttons to show, and what action the buttons take,
  // based on the type of update (report or approval)
  renderButtons(review: any) {
    const reported = review.reported
    if (reported === 1) {
      return (
        <div className="">
          <button
            type="button"
            className={styles.approvebutton}
            onClick={() => this.props.unReportHandler(review)}
          >
            {' '}
            Restore Review
          </button>
          <button
            type="button"
            className={styles.removebutton}
            onClick={() => this.props.removeHandler(review, false)}
          >
            {' '}
            Remove Review
          </button>
        </div>
      )
    } else {
      return (
        <div className="">
          <button
            type="button"
            className={styles.approvebutton}
            onClick={() => this.props.approveHandler(review)}
          >
            {' '}
            Confirm Review
          </button>
          <button
            type="button"
            className={styles.removebutton}
            onClick={() => this.props.removeHandler(review, true)}
          >
            {' '}
            Remove Review
          </button>
        </div>
      )
    }
  }

  render() {
    const review = this.props.info
    return (
      <div id = {review._id} className = {styles.pendingreview}>
        <div className = {styles.titleinfo}>
        <h4 className = "">
          Course: {this.state.shortName}, {this.state.longName}
        </h4>
        <p>{review.date}</p>
        </div>
        <div className = {styles.reviewinfo}>
          <p>Professor(s): {review.professors}</p>
          <p>Overall Rating: {review.rating}</p>
          <p>Difficult: {review.difficulty}</p>
          <br></br>
          <p>{review.text}</p>
        </div>
        <div className="">{this.renderButtons(review)}</div>
      </div>
    )
  }
}

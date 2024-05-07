import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../Styles/AdminReview.module.css'

type Props = {
    review: any
    approveHandler: (arg1: any) => any
    removeHandler: (arg1: any, arg2: any) => any
    unReportHandler: (arg1: any) => any
}

/*
  Update Review Component.

  Simple styling component that renders a single review (an li element)
  to show on the Admin interface. Admin-visible reviews will be of 2 types:
  - Unapproved: new reviews needing approval
  - Reported: reviews that have been reported and require admin undo
*/

const UpdateReview = ({review, approveHandler, removeHandler, unReportHandler}: Props) => {
    const [shortName, setShortName] = useState<string>("")
    const [fullName, setFullName] = useState<string>("")

    axios
    .post(`/api/getCourseById`, {
      courseId: review.class,
    })
    .then((response) => {
      const course = response.data.result
      if (course) {
        setShortName(course.classSub.toUpperCase() + ' ' + course.classNum)
        setFullName(course.classTitle)
      }
    })

    function renderButtons(review: any) {
        const reported = review.reported
        if (reported === 1) {
          return (
            <div className="">
              <button
                type="button"
                className={styles.approvebutton}
                onClick={() => unReportHandler(review)}
              >
                {' '}
                Restore Review
              </button>
              <button
                type="button"
                className={styles.removebutton}
                onClick={() => removeHandler(review, false)}
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
                onClick={() => approveHandler(review)}
              >
                {' '}
                Confirm Review
              </button>
              <button
                type="button"
                className={styles.removebutton}
                onClick={() => removeHandler(review, true)}
              >
                {' '}
                Remove Review
              </button>
            </div>
          )
        }
      }
    return (
      <div id = {review._id} className = {styles.pendingreview}>
        <div className = {styles.titleinfo}>
        <h4 className = "">
          Course: {shortName}, {fullName}
        </h4>
        <p>{review.date}</p>
        </div>
        <div className = {styles.reviewinfo}>
          <p>Professor(s): {review.professors}</p>
          <p>Overall Rating: {review.rating}</p>
          <p>Difficulty: {review.difficulty}</p>
          <p>Workload: {review.workload}</p>
          <br></br>
          <p>{review.text}</p>
        </div>
        <div className="">{renderButtons(review)}</div>
      </div>
    )
}
export default UpdateReview
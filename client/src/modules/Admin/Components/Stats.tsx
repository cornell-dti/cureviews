import React, { Component } from 'react'
import axios from 'axios'
import styles from '../Styles/Stats.module.css'
import { Review } from 'common'

type Props = {
  token: string
  approvedReviewCount: number
  pendingReviews: Review[]
  reportedReviews: Review[]
}
type State = {
  chartData: any[]
  step: number
  range: number
}

/*
  A Statistics component that gives data concerning the
  database and allows devs to moniter status and progress of the project
*/
export default class Stats extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      chartData: [],
      step: 14,
      range: 12,
    }
  }

  /* 
    Helper function that takes an array of reviews and returns an array of key-value pairs containing
    a course's name/id and the number of times it appears in the array of reviews.
    Used to print out a CSV of all approved reviews on the website and their review counts.
   */
  numReviewsPerClass(reviews: Review[]): {courseName?: string, reviewCount?: number | undefined}[] {
    const reviewsPerCourse: Map<string | undefined, number | undefined> = new Map()

    reviews.forEach(
      review => {
        if (reviewsPerCourse.has(review.class!)) {
          reviewsPerCourse.set(review.class!, reviewsPerCourse.get(review.class!)! + 1)
        } else {
          reviewsPerCourse.set(review.class!, 1)
        }
      }
    )
    
    const result: {courseName: string | undefined, reviewCount: number | undefined}[] = [];
    reviewsPerCourse.forEach((count, courseName) => {
      result.push({courseName, reviewCount: count})
    })
    return result
  }

  /*
    Helper method that converts an array of (course: number of reviews) objects to a
    CSV format that can be read out
  */
  getReviewsPerClassCSV() {
    let csv = 'Class,Number of Reviews\n'
    // const reviewsPerClass = this.numReviewsPerClass(this.props.pendingReviews)
    // reviewsPerClass.forEach(({courseName, reviewCount}) => {
    //   csv += courseName + ',' + reviewCount + '\n'
    // })
    return csv
  }

  /*
    Function to download a file containing all reviewed classes in the database and their
    number of reviews
  */
  downloadCSVFile = () => {
    const element = document.createElement('a')
    const file = new Blob([this.getReviewsPerClassCSV()], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = 'ReviewsPerClass.csv'
    document.body.appendChild(element) // Required for this to work in FireFox
    element.click()
  }

  render() {
    return (
      <div className={styles.diagnosticbox}>
        <h2>Diagnostic information</h2>
        <div className = {styles.stats}>
          <button className={styles.downloadButton} onClick={this.downloadCSVFile}>
            Download ApprovedReviewCount by Class
          </button>
          <p>Approved review count: {this.props.approvedReviewCount}</p>
          <p>Pending review count: {this.props.pendingReviews.length}</p>
          <p>Reported review count: {this.props.reportedReviews.length}</p>
        </div>
      </div>
    )
  }
}
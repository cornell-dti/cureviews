import React, { Component } from 'react'
import axios from 'axios'
import styles from '../Styles/Stats.module.css'
import { Review } from 'common'

type Props = {
  token: string
  approvedReviews: Review[]
  pendingReviews: Review[]
  reportedReviews: Review[]
}
type State = {
  // approvedReviews: any[]
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
      // approvedReviews: [];
      chartData: [],
      step: 14,
      range: 12,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  getChartData() {
    axios
      .post(`/api/getReviewsOverTimeTop15`, {
        token: this.props.token,
        step: this.state.step,
        range: this.state.range,
      })
      .then((resp) => {
        const res = resp.data.result
        let data: any[] = []
        //key-> EX: cs
        for (let key in res) {
          let finalDateObj: any = {} //{date1:totalNum, date2:totalNum}
          let obj: any = {} // {name: cs, data: {date1:totalNum, date2:totalNum}}
          obj.name = key

          //[{date1:totalNum}, {date2: totalNum}, ...]
          let arrDates = res[key]

          arrDates.forEach((arrEntry: any) => {
            let dateObject = Object.keys(arrEntry) //[date1]
            dateObject.forEach((date) => {
              finalDateObj[date] = arrEntry[date]
            })
          })

          obj.data = finalDateObj
          data.push(obj)
        }

        this.setState({ chartData: data })
      })
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
    const reviewsPerClass = this.numReviewsPerClass(this.props.approvedReviews)
    reviewsPerClass.forEach(({courseName, reviewCount}) => {
      csv += courseName + ',' + reviewCount + '\n'
    })
    return csv
  }

  handleClick = (e: any) => {
    e.preventDefault()
    this.getChartData()
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
          <p>Approved review count: {this.props.approvedReviews.length}</p>
          <p>Pending review count: {this.props.pendingReviews.length}</p>
          <p>Reported review count: {this.props.reportedReviews.length}</p>
        </div>
      </div>
    )
  }
}
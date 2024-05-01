import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../Styles/Stats.module.css'
import { Review } from 'common'

type StatsProps = {
    token: string
}

const Stats = ({token}: StatsProps) => {
    const [approvedRevCount, setApprovedRevCount] = useState<Number>(0)
    const [pendingRevCount, setPendingRevCount] = useState<Number>(0)
    const [reportedRevCount, setReportedRevCount] = useState<Number>(0)

    /*
      Calls route to update the approved, pending, and reported review counts
      Fires on every render to check for approvals or removals of reviews
    */
    useEffect(() => {
        axios
        .post('/api/countReviews', {token: token})
        .then((response) => {
          const result = response.data.result
          if (response.status === 200) {
            setApprovedRevCount(result.approved)
            setPendingRevCount(result.pending)
            setReportedRevCount(result.reported)
          } else {
            console.log('Error at countReviews')
          }
        })
      }
    )

    /*
      Function to download a file containing all reviewed classes in the database and their
      number of reviews
    */
    function downloadCSVFile() {
      const element = document.createElement('a')
      let csv = ""
      
      axios
        .post('/api/getCourseCSV', {token: token})
        .then((response) => {
          const result = response.data.result
          if (response.status === 200) {
            csv = result
          } else {
            console.log('Error at getCourseCSV')
          }
        })

      const file = new Blob([csv], {
        type: 'text/plain',
      })
      element.href = URL.createObjectURL(file)
      element.download = 'ReviewsPerClass.csv'
      document.body.appendChild(element) // Required for this to work in FireFox
      element.click()
    }

    return (
      <div className={styles.diagnosticbox}>
        <h2>Diagnostic information</h2>
        <div className = {styles.stats}>
          <button className={styles.downloadButton} onClick={downloadCSVFile}>
            Download ApprovedReviewCount by Class
          </button>
          <p>Approved review count: {approvedRevCount}</p>
          <p>Pending review count: {pendingRevCount}</p>
          <p>Reported review count: {reportedRevCount}</p>
        </div>
      </div>
    )
}

export default Stats
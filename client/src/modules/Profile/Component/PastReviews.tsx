import React from 'react'

import styles from '../Styles/PastReviews.module.css'

import { Review as ReviewType } from 'common'
import CourseReviews from '../../Course/Components/CourseReviews'

type PastReviewsType = {
  pastReviews: ReviewType[]
}
const PastReviews = ({ pastReviews }: PastReviewsType) => {
  return (
    <>
      <div className="">
        <div className={`${styles.pastHeader}`}>
          <p className={styles.pastHeaderText}>
            Past Reviews ({pastReviews?.length})
          </p>
        </div>
      </div>
      <div className={styles.reviewCard}>
        <CourseReviews
          reviews={pastReviews}
          isPreview={false}
          isProfile={true}
        />
      </div>
    </>
  )
}

export { PastReviews }

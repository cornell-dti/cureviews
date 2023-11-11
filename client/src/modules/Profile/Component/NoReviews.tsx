import React from 'react'

import styles from '../Styles/NoReviews.module.css'

const NoReviews = () => {
  return (
    <div className={styles.noReviewsContainer}>
      <div className={styles.noReviewsTitle}>
        Oops! Seems like you haven’t written any reviews yet.
      </div>
      <div className={styles.noReviewsSubtitle}>
        Add an anonymous review and get notified when a your review is approved.
      </div>
      <div className={styles.noReviewsImage}>
        <img src="/noReviews.svg" alt="No Reviews" height="100%"></img>
      </div>
    </div>
  )
}

export { NoReviews }

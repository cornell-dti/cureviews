import React from 'react'

import { Review as ReviewType } from 'common'
import styles from '../Styles/PendingReviews.module.css'
import CourseReviews from '../../Course/Components/CourseReviews'

type PendingReviewsProps = {
  pendingReviews: ReviewType[]
  hide: boolean
  setHide: React.Dispatch<React.SetStateAction<boolean>>
}

const PendingReviews = ({
  pendingReviews,
  hide,
  setHide,
}: PendingReviewsProps) => {
  return (
    <>
      <div className="row">
        <div className={`col ${styles.pendingHeader}`}>
          <p className={styles.pendingHeaderText}>
            Pending ({pendingReviews?.length})
          </p>
        </div>
        <div className={`col ${styles.hidePending}`}>
          <p onClick={() => setHide(!hide)} className={styles.hidePendingText}>
            Hide
          </p>
        </div>
      </div>
      <div className={hide === false ? styles.reviewCard : ''}>
        {hide === false ? (
          <CourseReviews
            reviews={pendingReviews}
            isPreview={false}
            isProfile={true}
          />
        ) : (
          <p></p>
        )}
      </div>
    </>
  )
}

export { PendingReviews }

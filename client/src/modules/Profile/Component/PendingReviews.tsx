import React from 'react'

import { Review as ReviewType } from 'common'
import styles from '../Styles/PendingReviews.module.css'
import CourseReviews from '../../Course/Components/CourseReviews'

import DropdownIcon from '../../../assets/icons/dropdownicon.svg'

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
      <div className={styles.pendingbar}>
        <div className={styles.pendingheader}>
          Pending Reviews ({pendingReviews?.length})
        </div>
        <div onClick={() => setHide(!hide)} className={styles.hide}>
          <img
            className={hide ? styles.flip : ''}
            src={DropdownIcon}
            alt="drop-down-pending-reviews"
          />
        </div>
      </div>
      <div className={hide === false ? styles.reviewcards : ''}>
        {hide === false && (
          <CourseReviews
            reviews={pendingReviews}
            isPreview={true}
            isProfile={true}
          />
        )}
      </div>
    </>
  )
}

export { PendingReviews }

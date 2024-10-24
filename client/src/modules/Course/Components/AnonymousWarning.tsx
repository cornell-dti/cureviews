import React from 'react'

import styles from '../Styles/AnonymousWarning.module.css'

import Anonymous from '../../../assets/img/anonymous.png'
import { useAuthOptionalLogin } from '../../../auth/auth_utils'
import { useHistory } from 'react-router-dom'

type Props = {
    open: boolean
  }

const AnonymousWarning = ({ open }: Props) => {
    const {isLoggedIn, signIn} = useAuthOptionalLogin()
    const history = useHistory()

    if (!open) {
      return <></>
    }

    if (isLoggedIn) {
        return (
          <div className={styles.warningContainer}>
            <div className={styles.anonymousLogo}>
              <img src={Anonymous} className="anonymous-logo" alt="anonymous logo" />
            </div>
            <div className={styles.message}>
              <span className="line1">Don't worry - all your reviews are<br /></span> <span className={styles.line2}> anonymous!</span>
            </div>
            <button
              className={`${styles.button}`}
              onClick={() => history.push('/profile')}
            >
              Submit Review
            </button>
            <div className={styles.pastReviewsMessage}>
              You will be redirected to your past reviews page
            </div>
          </div>
        )
      }
    /**
     * Anonymous warning modal that is rendered when the user is not signed in
     */
    else {
        return (
            <div className={styles.warningContainer}>
            <div className={styles.anonymousLogo}>
                <img src={Anonymous} className="anonymous-logo" alt="anonymous logo" />
            </div>
            <div className={styles.message}>
                <span className="line1">Login to submit - all your reviews are<br /></span> <span className={styles.line2}> anonymous!</span>
            </div>
            <button
                className={`${styles.button}`}
                onClick={() => signIn('profile')}
            >
                Login
            </button>
            <div className={styles.pastReviewsMessage}>
                You will be redirected to your past reviews page
            </div>
            </div>
        )
    }
}

export default AnonymousWarning
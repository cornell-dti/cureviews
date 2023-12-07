import React, { useState } from 'react'

import AnonymousLogo from '../../../assets/img/anonymous.png'

import styles from '../Styles/Anonymous.module.css'

import { useAuthOptionalLogin } from '../../../auth/auth_utils'

// type AnonymousWarningProps = {
//   onSubmitReview: (review: NewReview) => void
// }

const AnonymousWarning = ({
}) => {
  const [isRemember, setIsRemember] = useState(false)
  const [isLoggedIn, token, netId, signIn] = useAuthOptionalLogin()

  /**
   * Signs in user and posts review if sign in is successful
   */
  function onVerifyEmail() {
    signIn('course')
  }

  /**
   * Anonymous warning modal that is rendered when the user is signed in
   */
  if (isLoggedIn) {
    return (
      <div className={styles.warningContainer}>
        <div className={styles.anonymousLogo}>
          <img src={AnonymousLogo} className="anonymous-logo" alt="anonymous logo" />
        </div>
        <div className={styles.message}>
          <span className="line1">Don't worry - all your reviews are<br /></span> <span className={styles.line2}> anonymous!</span>
        </div>
        <button
          className={`${styles.button}`}
        >
          Proceed to Posting
        </button>
        <div className={styles.pastReviewsMessage}>
          You will be redirected to your past reviews page. <br /> Not seeing it? Click here
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
          <img src={AnonymousLogo} className="anonymous-logo" alt="anonymous logo" />
        </div>
        <div className={styles.message}>
          <span className="line1">Don't worry - all your reviews are<br /></span> <span className={styles.line2}> anonymous!</span>
        </div>
        <button
          className={`${styles.button}`}
          onClick={() => onVerifyEmail()}
        >
          Verify Cornell Email
        </button>
        <label className={styles.rememberMeCheckboxLabel}>
          <input
            type="checkbox"
            name="remember-me-checkbox"
            checked={isRemember}
            onChange={(event) => setIsRemember(event.target.checked)}
          />
          <span className={styles.rememberMeCheckboxLabelText}>
            Remember me
          </span>
        </label>
        <div className={styles.pastReviewsMessage}>
          You will be redirected to your past reviews page. <br /> Not seeing it? Click here
        </div>
      </div>
    )
  }
}

export default AnonymousWarning

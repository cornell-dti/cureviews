import React from 'react'
import styles from '../Styles/UserInfo.module.css'
import ProfileCard from './ProfileCard'

type UserInfoProps = {
  profilePicture: string
  reviewsTotal: string
  reviewsHelpful: string
  netId: string
  signOut: () => void
}

const UserInfo = ({
  profilePicture,
  reviewsHelpful,
  reviewsTotal,
  netId,
  signOut,
}: UserInfoProps) => {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileTitle}>My Dashboard</div>
      <div className={styles.profileInfo}>
        <img
          className={styles.profileImage}
          src={profilePicture}
          alt="user profile bear"
        />
        <div className={styles.profileVerifiedNeId}>{netId}</div>
        <div className={styles.profileUserStatistics}>
          <div className={styles.profileUserStatisticsText}>
            User Statistics
          </div>

          <ProfileCard
            title="Reviews Total"
            value={reviewsTotal}
            image="/total_reviews_icon.svg"
          />
          <ProfileCard
            title="People found your reviews helpful"
            value={reviewsHelpful}
            image="/helpful_review_icon.svg"
          ></ProfileCard>
        </div>
      </div>
      <button className={styles.profileSignOutButton} onClick={signOut}>
        <p className={styles.profileSignOutText}>Sign Out</p>
      </button>
    </div>
  )
}

export { UserInfo }

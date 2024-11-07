import React from 'react'
import styles from '../Styles/UserInfo.module.css'
import ProfileCard from './ProfileCard'

type UserInfoProps = {
  profilePicture: string
  reviewsLeft: number
  upvoteCount: number
  netId: string
  signOut: () => void
}

const UserInfo = ({
  profilePicture,
  upvoteCount,
  reviewsLeft,
  netId,
  signOut,
}: UserInfoProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>My Dashboard</div>
      <img
        className={styles.profileimage}
        src={profilePicture}
        alt="user profile bear"
      />
      <div className={styles.netid}>{netId}</div>
      <div className={styles.subtitle}>User Statistics</div>
      <div className={styles.statssection}>
        <ProfileCard
          title="Reviews"
          value={reviewsLeft}
          image="/total_reviews_icon.svg"
        />
        <ProfileCard
          title="Upvotes"
          value={upvoteCount}
          image="/helpful_review_icon.svg"
        ></ProfileCard>
      </div>
      <button className={styles.signoutbutton} onClick={signOut}>
        Log Out
      </button>
    </div>
  )
}

export { UserInfo }

import React from 'react'

import styles from '../Styles/ProfileCard.module.css'

type ProfileCardProps = {
  title: string
  value: string
  image: any
}

/**
  Profile Component.

  Simple styling component that renders a student's review statistics
  on their profile:
    - Total reviews made
    - Total upvotes on reviews made
*/
const ProfileCard = ({ title, value, image }: ProfileCardProps) => {
  return (
    <div className={styles.profileCardContainer}>
      <div className={styles.profileCardValue}>{value}</div>
      <div className={styles.profileCardTitle}>{title}</div>
      <img
        className={styles.profileCardImage}
        src={image}
        alt="total reviews icon"
      />
    </div>
  )
}

export default ProfileCard

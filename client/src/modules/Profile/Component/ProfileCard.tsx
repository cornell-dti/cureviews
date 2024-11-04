import React from 'react'

import styles from '../Styles/ProfileCard.module.css'

type ProfileCardProps = {
  title: string
  value: number
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
    <div className={styles.card}>
      <div className={styles.container}>
        <div className={styles.count}>{value}</div>
        <div className={styles.description}>{title}</div>
        <img className={styles.img} src={image} alt="total reviews icon" />
      </div>
    </div>
  )
}

export default ProfileCard

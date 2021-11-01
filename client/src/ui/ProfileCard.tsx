import React from 'react'

import styles from "./css/ProfileCard.module.css";

type ProfileCardProps = {
  title: string;
  value: string;
  image: any;
};

export default function ProfileCard({title, value, image} : ProfileCardProps) {
  return (
    <div className={styles.profileCardContainer}>
      <div className={styles.profileCardCenterText}>
        <div className={styles.profileCardValue}>{value}</div>
        <div className={styles.profileCardTitle}>{title}</div>
        <img className={styles.profileCardImage} src={image} alt="total reviews icon"/>
      </div>
    </div>
  )
}

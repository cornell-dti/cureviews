import React from "react";
import ProfileCard from "./ProfileCard";

import styles from "./css/Profile.module.css";

type ProfileProps = {
  imageSrc: any;
  verifiedEmail: string;
};

export default function Profile({
  imageSrc = "/profile_bear.png",
  verifiedEmail = "myl39@cornell.edu",
}: ProfileProps) {
  return (
    <div className="row">
      <div className="col-4">
        <div className={styles.profileContainer}>
          <div className={styles.profileTitle}>Profile</div>
          <div className={styles.profileInfo}>
            <img src={imageSrc} alt="user" />
            <div className={styles.profileVerifiedEmail}>
              Verified as: {verifiedEmail}
            </div>
            <div className={styles.profileUserStatisticsText}>
              User Statistics
            </div>
            <div className={styles.profileUserStatistics}>
              <ProfileCard
                title="Reviews Total"
                value="12"
                image="/total_reviews_icon.svg"
              />
              <ProfileCard
                title="People found your reviews helpful"
                value="7"
                image="/helpful_review_icon.svg"
              ></ProfileCard>
              <ProfileCard
                title="Views Total"
                value="12"
                image="/views_icon.svg"
              ></ProfileCard>
            </div>
            <button className={styles.profileSignOutButton}>
              <p className={styles.profileSignOutText}>Signout</p>
            </button>
          </div>
        </div>
      </div>
      <div className="col"></div>
    </div>
  );
}

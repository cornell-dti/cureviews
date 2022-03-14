import React from "react";
import ProfileCard from "./ProfileCard";
import Navbar from './Navbar';

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
    <div>
      <Navbar userInput = {""}></Navbar>

      <div className="row">

        <div className="col-lg-4">
          <div className={styles.profileContainer}>
            <div className={styles.profileTitle}>Profile</div>
            <div className={styles.profileInfo}>
              <img src={imageSrc} alt='user' />
              <div className={styles.profileVerifiedEmail}>
                Verified as: {verifiedEmail}
              </div>
              <div className={styles.profileUserStatisticsText}>User Statistics</div>
              <div className={styles.profileUserStatistics}>
                <ProfileCard
                  title='Reviews Total'
                  value='12'
                  image='/total_reviews_icon.svg'
                />
                <ProfileCard
                  title='People found your reviews helpful'
                  value='7'
                  image='/helpful_review_icon.svg'
                ></ProfileCard>
                <ProfileCard
                  title='Views Total'
                  value='12'
                  image='/views_icon.svg'
                ></ProfileCard>
              </div>
              <button className={styles.profileSignOutButton}>
                <p className={styles.profileSignOutText}>Signout</p>
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">

          <div className={styles.myReviews}>

          <h1 className={styles.myReviewsHeader}>My Reviews (18)</h1>

          <div className={styles.myReviewsList}>

            {/* Pending Header */}
            <div className="row">
              <div className={`col ${styles.pendingHeader}`}>
                <p className={styles.pendingHeaderText}>Pending</p>
              </div>
              <div className={`col ${styles.hidePending}`}>
                <p className={styles.hidePendingText}>Hide</p>
              </div>

            </div>

            {/* Pending Reviews */}
            <div></div>

            {/* My Reviews Header */}
            <div className="row">
              <div className={`col ${styles.pastHeader}`}>
                <p className={styles.pastHeaderText}>Past Reviews (16)</p>
              </div>
            </div>

            {/* My Reviews */}
            <div></div>


          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

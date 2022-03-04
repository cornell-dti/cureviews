import React, { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard";
import "./css/ClassView.css";
import "./css/App.css";
import "rodal/lib/rodal.css";
import "./css/Form.css";
import "./css/ResultsDisplay.css";
import { Review as ReviewType } from "common";

import styles from "./css/Profile.module.css";
import CourseReviews from "./CourseReviews";
import axios from "axios";

type netId = string;

type ProfileProps = {
  imageSrc: any;
  netId: string;
};

//axl4

export default function Profile({
  imageSrc = "/profile_bear.png",
  netId = "sj598",
}: ProfileProps) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  //create a new state for pending & non-pending reviews reviews

  /**
   * Arrow functions for sorting reviews
   */
  const sortByLikes = (a: ReviewType, b: ReviewType) =>
    (b.likes || 0) - (a.likes || 0);
  const sortByDate = (a: ReviewType, b: ReviewType) =>
    !!b.date ? (!!a.date ? b.date.getTime() - a.date.getTime() : -1) : 1;

  useEffect(() => {
    axios.post(`/v2/getReviewsByStudentId`, { netId }).then((response) => {
      const reviews = response.data.result.message;
      setReviews(reviews);
      setLoading(false);
    });
  }, [netId]);

  function sortReviewsBy(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const currentReviews = reviews && [...reviews];
    if (value === "helpful") {
      currentReviews?.sort(sortByLikes);
    } else if (value === "recent") {
      currentReviews?.sort(sortByDate);
    }
    setReviews(currentReviews);
  }

  if (!loading) {
    return (
      <div className={"row"}>
        <div className={`col-4 ${styles.profileLeft}`}>
          <div className={styles.profileContainer}>
            <div className={styles.profileTitle}>Profile</div>
            <div className={styles.profileInfo}>
              <img src={imageSrc} alt="user" />
              <div className={styles.profileVerifiedEmail}>
                Verified as: {netId}@cornell.edu
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
        <div className={`col ${styles.profileRight}`}>
          <div className={styles.profileReviewsContainer}>
            <div className={styles.reviewsHeader}>
              <h2 className={styles.myReviews}>
                My Reviews ({reviews?.length})
              </h2>
              <div className={styles.sortContainer}>
                <label className={styles.sortByLabel} htmlFor="sort-reviews-by">
                  Sort By:
                </label>
                <select
                  onChange={sortReviewsBy}
                  className={styles.sortBySelect}
                  id="sort-reviews-by"
                >
                  <option value="helpful">Most Helpful</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
            {reviews.length > 0 && (
              <div className={styles.courseReviews}>
                <CourseReviews reviews={reviews} />
              </div>
            )}
            {reviews.length === 0 && <div>no reviewsss</div>}
          </div>
        </div>
      </div>
    );
  }
  return <>Loading...</>;
}

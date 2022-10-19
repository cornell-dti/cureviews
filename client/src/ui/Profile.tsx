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
import Navbar from "./Navbar";
import { Redirect } from "react-router-dom";
import { useAuthMandatoryLogin } from "../auth/auth_utils";

export default function Profile(imgSrc: any) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [pendingReviews, setPendingReviews] = useState<ReviewType[]>([]);
  const [pastReviews, setPastReviews] = useState<ReviewType[]>([]);

  const [reviewsTotal, setReviewsTotal] = useState("");
  const [reviewsHelpful, setReviewsHelpful] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [netId, setNetId] = useState("");

  const [isLoggedIn, token, isAuthenticating, signOut] = useAuthMandatoryLogin("profile");

  async function getVerifiedEmail() {
    const response = await axios.post("/v2/getStudentEmailByToken", {
      token: token,
    });

    const res = response.data.result;
    if (res.code === 200) {
      console.log(res.message);
      setVerifiedEmail(res.message);
    }

    setNetId(verifiedEmail.substring(0, verifiedEmail.lastIndexOf("@")));
  }
  async function getReviewsTotal() {
    const response = await axios.post("/v2/countReviewsByStudentId", {
      netId,
    });

    const res = response.data.result;
    if (res.code === 200) {
      setReviewsTotal(res.message);
    }
  }

  async function getReviewsHelpful() {
    const response = await axios.post("/v2/getTotalLikesByStudentId", {
      netId,
    });

    const res = response.data.result;
    if (res.code === 200) {
      setReviewsHelpful(res.message);
    }
  }

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
      const pendingReviews = reviews.filter(function (review: ReviewType) {
        return review.visible === 0;
      });
      const pastReviews = reviews.filter(function (review: ReviewType) {
        return review.visible === 1;
      });
      setReviews(reviews);
      setPendingReviews(pendingReviews);
      setPastReviews(pastReviews);
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

  getVerifiedEmail();
  getReviewsTotal();
  getReviewsHelpful();

  if (!loading && isLoggedIn) {
    return (
      <div className={`row ${styles.fullScreen}`}>
        <Navbar userInput="" />
        <div className={`col-3 ${styles.profileLeft}`}>
          <div className={styles.profileContainer}>
            <div className={styles.profileTitle}>Profile</div>
            <div className={styles.profileInfo}>
              <img className={styles.profileImage} src={`${String(imgSrc.imgSrc)}`} alt="user" />
              <div className={styles.profileVerifiedEmail}>
                Verified as: {netId}@cornell.edu
              </div>
              <div className={styles.profileUserStatisticsText}>
                User Statistics
              </div>
              <div className={styles.profileUserStatistics}>
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
              <button className={styles.profileSignOutButton} onClick={signOut}>
                <p className={styles.profileSignOutText}>Sign Out</p>
              </button>
            </div>
          </div>
        </div>
        <div className={`col ${styles.profileRight}`}>
          <div className={styles.profileReviewsContainer}>
            <div className={styles.reviewsHeader}>
              <h2 className={styles.myReviewsText}>
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
            {reviews.length === 0 && (
              <div className={styles.noReviewsContainer}>
                <div className={styles.noReviewsTitle}>
                  Oops! Seems like you haven’t written any reviews yet.
                </div>
                <div className={styles.noReviewsSubtitle}>
                  Add an anonymous review and get notified when a your review is
                  approved.
                </div>
                <div className={styles.noReviewsImage}>
                  <img
                    src="/noReviews.svg"
                    alt="No Reviews"
                    height="100%"
                  ></img>
                </div>
              </div>
            )}
            {reviews.length > 0 && pendingReviews.length > 0 && (
              <>
                <div className="row">
                  <div className={`col ${styles.pendingHeader}`}>
                    <p className={styles.pendingHeaderText}>
                      Pending ({pendingReviews?.length})
                    </p>
                  </div>
                  <div className={`col ${styles.hidePending}`}>
                    <p className={styles.hidePendingText}>Hide</p>
                  </div>
                </div>
                <div className={styles.pendingReviews}>
                  <CourseReviews
                    reviews={pendingReviews}
                    isPreview={false}
                    isProfile={true}
                  />
                </div>
                <div className="row">
                  <div className={`col ${styles.pastHeader}`}>
                    <p className={styles.pastHeaderText}>
                      Past Reviews ({pastReviews?.length})
                    </p>
                  </div>
                </div>
                <div className={styles.pastReviews}>
                  <CourseReviews
                    reviews={pastReviews}
                    isPreview={false}
                    isProfile={true}
                  />
                </div>
              </>
            )}
            {reviews.length > 0 && pendingReviews.length === 0 && (
              <>
                <div className={styles.myReviews}>
                  <CourseReviews
                    reviews={reviews}
                    isPreview={false}
                    isProfile={true}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  } else if (!loading && !token && !isAuthenticating) {
    return <Redirect to="/" />;
  }
  return <>Loading...</>;
}

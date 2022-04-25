import React, { useState } from "react";
import ProfileCard from "./ProfileCard";
import { Session } from "../session-store";

import styles from "./css/Profile.module.css";
import axios from "axios";

type ProfileProps = {
  imageSrc: any;
};

export default function Profile({
  imageSrc = "/profile_bear.png",
}: ProfileProps) {
  const [netId, setNetId] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [reviewsTotal, setReviewsTotal] = useState("");
  const [reviewsHelpful, setReviewsHelpful] = useState("");

  async function getVerifiedEmail() {
    const response = await axios.post("/v2/getStudentEmailByToken", {
      token: Session.get("token"),
    });

    const res = response.data.result;
    if (res.code === 200) {
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

  getVerifiedEmail();
  getReviewsTotal();
  getReviewsHelpful();
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileTitle}>Profile</div>
      <div className={styles.profileInfo}>
        <img src={imageSrc} alt="user" />
        <div className={styles.profileVerifiedEmail}>
          Verified as: {verifiedEmail}
        </div>
        <div className={styles.profileUserStatisticsText}>User Statistics</div>
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
      </div>
    </div>
  );
}

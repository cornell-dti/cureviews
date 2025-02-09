import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Review } from 'common';
import UpdateReview from './UpdateReviews';
import ReviewFilters from './ReviewFilters';
import styles from './Reviews.module.css';

type Props = {
  token: string;
};

const Reviews = ({ token }: Props) => {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!token) return;
    const loadReviews = async () => {
      try {
        const pending = await axios.post('/api/admin/reviews/get-pending', { token });
        if (pending.status === 200) setPendingReviews(pending.data.result);

        const reported = await axios.post('/api/admin/reviews/get-reported', { token });
        if (reported.status === 200) setReportedReviews(reported.data.result);
      } catch (error) {
        console.error("Error loading reviews", error);
      }
    };
    loadReviews();
  }, [token]);

  const approveReview = async (review: Review) => {
    try {
      const response = await axios.post('/api/admin/reviews/approve', { review, token });
      if (response.status === 200) {
        setPendingReviews(pendingReviews.filter(r => r._id !== review._id));
      }
    } catch (error) {
      console.error("Failed to approve review", error);
    }
  };

  const removeReview = async (review: Review, isUnapproved: boolean) => {
    try {
      const response = await axios.post('/api/admin/reviews/remove', { review, token });
      if (response.status === 200) {
        if (isUnapproved) {
          setPendingReviews(pendingReviews.filter(r => r._id !== review._id));
        } else {
          setReportedReviews(reportedReviews.filter(r => r._id !== review._id));
        }
      }
    } catch (error) {
      console.error("Failed to remove review", error);
    }
  };

  const unReportReview = async (review: Review) => {
    try {
      const response = await axios.post('/api/admin/reviews/restore', { review, token });
      if (response.status === 200) {
        setReportedReviews(reportedReviews.filter(r => r._id !== review._id));
      }
    } catch (error) {
      console.error("Failed to unreport review", error);
    }
  };

  return (
    <div className={styles.reviewsPage}>
      <h1>Reviews Dashboard</h1>
      <ReviewFilters />

      {/* ✅ Render Pending Reviews */}
      <div className="pending-reviews">
        <h2>Pending Reviews</h2>
        {pendingReviews.map(review => (
          <UpdateReview
            key={review._id}
            review={review}
            approveHandler={approveReview}
            removeHandler={removeReview}
            unReportHandler={unReportReview}
          />
        ))}
      </div>

      {/* ✅ Render Reported Reviews */}
      <div className="reported-reviews">
        <h2>Reported Reviews</h2>
        {reportedReviews.map(review => (
          <UpdateReview
            key={review._id}
            review={review}
            approveHandler={approveReview}
            removeHandler={removeReview}
            unReportHandler={unReportReview}
          />
        ))}
      </div>
    </div>
  );
};

export default Reviews;

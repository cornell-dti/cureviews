import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Review } from 'common';
import AdminReview from './AdminReview';
import styles from '../Styles/AdminReview.module.css';
import Dropdown from "./Dropdown";
import Stats from "./Stats";

type Props = {
  token: string;
};

type ReviewCategory = 'pending' | 'reported' | 'approved';

const Reviews = ({ token }: Props) => {
  const [activeTab, setActiveTab] = useState<ReviewCategory>('pending');
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [numReviews, setNumReviews] = useState<number>(10);

  useEffect(() => {
    if (!token) return;
    const loadReviews = async () => {
      try {
        const pending = await axios.post('/api/admin/reviews/get-pending', {
          token
        });
        if (pending.status === 200) setPendingReviews(pending.data.result);

        const reported = await axios.post('/api/admin/reviews/get-reported', {
          token
        });
        if (reported.status === 200) setReportedReviews(reported.data.result);
      } catch (error) {
        console.error('Error loading reviews', error);
      }
    };
    loadReviews();
  }, [token]);

  useEffect(() => {
    if (!token || activeTab !== 'approved') return;

    const loadApprovedReviews = async () => {
      try {
        const response = await axios.post('/api/admin/reviews/get-approved', {
          token,
          limit: numReviews
        });

        if (response.status === 200) {
          setApprovedReviews(response.data.result);
        }
      } catch (error) {
        console.error('Error fetching approved reviews', error);
      }
    };

    loadApprovedReviews();
  }, [token, activeTab, numReviews]);

  const approveReview = async (review: Review) => {
    try {
      const response = await axios.post('/api/admin/reviews/approve', {
        review,
        token
      });
      if (response.status === 200) {
        setPendingReviews(pendingReviews.filter((r) => r._id !== review._id));
      }
    } catch (error) {
      console.error('Failed to approve review', error);
    }
  };

  const removeReview = async (review: Review, isUnapproved: boolean) => {
    try {
      const response = await axios.post('/api/admin/reviews/remove', {
        review,
        token
      });
      if (response.status === 200) {
        if (isUnapproved) {
          setPendingReviews(pendingReviews.filter((r) => r._id !== review._id));
        } else {
          setReportedReviews(
            reportedReviews.filter((r) => r._id !== review._id)
          );
        }
      }
    } catch (error) {
      console.error('Failed to remove review', error);
    }
  };

  const unReportReview = async (review: Review) => {
    try {
      const response = await axios.post('/api/admin/reviews/restore', {
        review,
        token
      });
      if (response.status === 200) {
        setReportedReviews(reportedReviews.filter((r) => r._id !== review._id));
      }
    } catch (error) {
      console.error('Failed to unreport review', error);
    }
  };

  const renderReviews = (reviews: Review[], category: ReviewCategory) => {
    return (
      <div className={styles.reviewsList}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <AdminReview
              key={review._id}
              review={review}
              approveHandler={
                category === 'pending' ? approveReview : undefined
              }
              removeHandler={
                category === 'pending' || category === 'reported'
                  ? (r) => removeReview(r, category === 'pending')
                  : undefined
              }
              unReportHandler={
                category === 'reported' ? unReportReview : undefined
              }
            />
          ))
        ) : (
          <p className={styles.noReviews}>
            No reviews available in this category.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={styles.reviewsPage}>
      <h1>Reviews Dashboard</h1>
      <Stats token={token}/>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <div className={styles.tabContent}>
              <span>Pending Reviews</span>
              {pendingReviews.length > 0 && (
                <span className={styles.badge}>{pendingReviews.length}</span>
              )}
            </div>
            <div className={styles.underline} />
          </button>

          <button
            className={`${styles.tabButton} ${activeTab === 'approved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            <div className={styles.tabContent}>
              <span>Recently Approved</span>
            </div>
            <div className={styles.underline} />
          </button>

          <button
            className={`${styles.tabButton} ${activeTab === 'reported' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('reported')}
          >
            <div className={styles.tabContent}>
              <span>Reported Reviews</span>
              {reportedReviews.length > 0 && (
                <span className={styles.badge}>{reportedReviews.length}</span>
              )}
            </div>
            <div className={styles.underline} />
          </button>
        </div>
        {activeTab === 'pending' && renderReviews(pendingReviews, 'pending')}
        {activeTab === 'approved' && (
          <>
            <div className={styles.numReviewsSelector}>
              <Dropdown selectedValue={numReviews} onChange={setNumReviews} />
            </div>

            {renderReviews(approvedReviews, 'approved')}
          </>
        )}
        {activeTab === 'reported' && renderReviews(reportedReviews, 'reported')}
      </div>
    </div>
  );
};

export default Reviews;

import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Session } from '../../../session-store';

import { Review as ReviewType } from 'common';

import Navbar from '../../Globals/Navbar';
import Loading from '../../Globals/Loading';

import { UserInfo } from './UserInfo';
import { NoReviews } from './NoReviews';
import { PendingReviews } from './PendingReviews';
import { PastReviews } from './PastReviews';
import type { NewReview } from '../../../types';

import { useAuthMandatoryLogin } from '../../../auth/auth_utils';
import { randomPicture } from '../../Globals/profile_picture';

import styles from '../Styles/Profile.module.css';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [hidePastReviews, setHidePastReviews] = useState(false);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [pendingReviews, setPendingReviews] = useState<ReviewType[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<ReviewType[]>([]);

  const [reviewCount, setReviewCount] = useState(0);
  const [upvoteCount, setUpvoteCount] = useState(0);

  const { isLoggedIn, token, netId, isAuthenticating, signOut } =
    useAuthMandatoryLogin('profile');

  const profilePicture: string = randomPicture(netId);

  /**
   * Sorts reviews based on descending likes.
   */
  const sortByLikes = (a: ReviewType, b: ReviewType) =>
    (b.likes || 0) - (a.likes || 0);

  /**
   * Sorts reviews based on descending date.
   */
  const sortByDate = (a: ReviewType, b: ReviewType) =>
    b.date instanceof Date && a.date instanceof Date
      ? b.date.getTime() - a.date.getTime()
      : -1;

  /**
   * Sorts reviews based on ascending alphabetical order.
   */
  const sortByProf = (a: ReviewType, b: ReviewType) => {
    let valA = 'Not Listed';
    let valB = 'Not Listed';

    if (a.professors) {
      const profsA = a.professors.filter((prof : String) =>
        prof && prof !== 'Not Listed')
      valA = profsA.length > 0
        ? profsA.sort()[0]
        : 'Not Listed'
    } else {
      return 1
    }
    if (b.professors) {
      const profsB = b.professors.filter((prof : String) =>
        prof && prof !== 'Not Listed')
      valB = profsB.length > 0
        ? profsB.sort()[0]
        : 'Not Listed'
    } else {
      return 1
    }

    if (valA === 'Not Listed') {
      return 1
    } else if (valB === 'Not Listed') {
      return 1
    }
    
    if (valA < valB) {
      return -1
    } else if (valB < valA) {
      return 1
    }

    return 0
  }

  // async function getReviewsTotal() {
  //     const response = await axios.post('/api/profiles/count-reviews', {
  //       netId,
  //     });
  //     if (response.status === 200) {
  //       const userReviewCount = response.data.result;
  //       setReviewCount(userReviewCount + 1);
  //     }
  // }

  /**
   * Hook that handles
   * 1. Get + Set reviews
   * 2. Get + Set review + upvote counts for user
   */
  useEffect(() => {
    async function getReviews() {
      const response = await axios.post(`/api/profiles/get-reviews`, { netId });
      const _reviews = response.data.result;
      if (_reviews) {
        const _pendingReviews = _reviews.filter(function (review: ReviewType) {
          return !review.visible;
        });
        const _approvedReviews = _reviews.filter(function (review: ReviewType) {
          return review.visible;
        });
  
        setReviews(_reviews);
        setPendingReviews(_pendingReviews);
        setApprovedReviews(_approvedReviews.sort(sortByLikes));
        setLoading(false);
        setReviewCount(_pendingReviews.length + _approvedReviews.length)
      }
    }
  
    async function getReviewsHelpful() {
      const response = await axios.post('/api/profiles/get-likes', {
        netId,
      });
  
      if (response.status === 200) {
        const userTotalUpvotes = response.data.result;
        setUpvoteCount(userTotalUpvotes);
      }
    }

    // Only update reviews if we have a given user's netId + they are no longer authenticating.
    if (netId && !isAuthenticating) {
      getReviews();
      // getReviewsTotal();
      getReviewsHelpful();
    }
  }, [netId, isAuthenticating]);

  /**
   * Clear review stored in session storage
   */
  function clearSessionReview() {
    Session.setPersistent({ review: '' });
    Session.setPersistent({ review_major: '' });
    Session.setPersistent({ review_num: '' });
    Session.setPersistent({ courseId: '' });
  }

  /**
   * Checks if there is a review stored in Session (i.e. this redirected from
   * auth)
   */
  useEffect(() => {
    /**
     * Submit review and clear session storage
     */
    async function submitReview(review: NewReview, courseId: string) {
      try {
        const response = await axios.post('/api/reviews/post', {
          token: token,
          review: review,
          courseId: courseId,
        });

        clearSessionReview();
        if (response.status === 200) {
          toast.success(
            'Thanks for reviewing! New reviews are updated every 24 hours.'
          );
          const pending = response.data.result
          setPendingReviews(pending);
        } else {
          toast.error('An error occurred, please try again.');
        }
      } catch (e) {
        clearSessionReview();
        toast.error('An error occurred, please try again.');
      }
    }

    const sessionReview = Session.get('review');
    const sessionCourseId = Session.get('courseId');
    if (
      sessionReview !== undefined &&
      sessionReview !== '' &&
      sessionCourseId !== undefined &&
      sessionCourseId !== '' &&
      isLoggedIn
    ) {
      submitReview(sessionReview, sessionCourseId);
    }
  }, [isLoggedIn, token]);

  function sortReviewsBy(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    if (value === 'helpful') {
      setApprovedReviews([...approvedReviews].sort(sortByLikes));
    } else if (value === 'recent') {
      setApprovedReviews([...approvedReviews].sort(sortByDate));
    } else if (value === 'professor') {
      setApprovedReviews([...approvedReviews].sort(sortByProf))
    }
  }

  if (!loading && isLoggedIn) {
    return (
      <div className={styles.page}>
        <Navbar userInput="" />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className={styles.container}>
          <div className={styles.usersection}>
            <UserInfo
              profilePicture={profilePicture}
              upvoteCount={upvoteCount}
              reviewsTotal={reviewCount}
              netId={netId}
              signOut={signOut}
            />
          </div>

          <div className={styles.reviewsection}>
            <div className={styles.bar}>
              <h2>My Reviews ({reviewCount})</h2>
              <div>
                <label htmlFor="sort-reviews-by">Sort By:</label>
                <select
                  onChange={sortReviewsBy}
                  className={styles.filtertext}
                  id="sort-reviews-by"
                >
                  <option value="helpful">Most Helpful</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
            {reviews.length === 0 && <NoReviews />}
            {reviews.length > 0 && pendingReviews.length > 0 && (
              <>
                <PendingReviews
                  key={pendingReviews.length}
                  hide={hidePastReviews}
                  setHide={setHidePastReviews}
                  pendingReviews={pendingReviews}
                />
                <PastReviews
                  pastReviews={approvedReviews}
                />
              </>
            )}
            {reviews.length > 0 && pendingReviews.length === 0 && (
              <PastReviews
                pastReviews={approvedReviews}
              />
            )}
          </div>
        </div>
      </div>
    );
  } else if (!loading && !token && !isAuthenticating) {
    return <Redirect to="/" />;
  }

  return <Loading />;
};

export { Profile };

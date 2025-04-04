import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { Review as ReviewType } from 'common';

import styles from '../Styles/ReviewCard.module.css';
import previewstyle from '../Styles/PreviewCard.module.css';

import { getAuthToken, useAuthOptionalLogin } from '../../../auth/auth_utils';

// use review.visible for pending

type ReviewProps = {
  review: ReviewType;
  isPreview: boolean;
  isProfile: boolean;
};

/**
  A Preview Review Component.

  Renders a review for 
    i. profile page
      a. pending review (isprofile && ispreview)
      b. regular past review (isprofile)
    ii. search page (ispreview)

  if 

  Simple styling component that renders a single review (an li element)
  to show in a ClassView. These reivews will include:
  - how long ago the reivew was added
  - all review content
  - report button
  - like button
*/
const PreviewReviewCard = ({
  review,
  isPreview,
  isProfile
}: ReviewProps): React.JSX.Element => {
  const { isLoggedIn } = useAuthOptionalLogin();
  const pending = isPreview && isProfile;
  const [liked, setLiked] = useState<boolean>(false);
  const _review = review;

  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseSub, setCourseSub] = useState<string>('');
  const [courseNum, setCourseNum] = useState<string>('');

  /** Turns our date objects into a string form to render. */
  const dateToString = () => {
    if (!_review.date) return '';

    const date = new Date(_review.date);
    let reviewYear = String(date.getFullYear()).substring(2);
    let reviewMonth = date.getMonth() + 1;
    let reviewDay = date.getDate();

    return reviewMonth + '/' + reviewDay + '/' + reviewYear;
  };

  /**
   * Fetch the course information.
   */
  useEffect(() => {
    const updateCourse = async () => {
      const response = await axios.post(`/api/courses/get-by-id`, {
        courseId: _review.class
      });
      const course = response.data.result;
      if (course) {
        setCourseTitle(course.classTitle);
        setCourseSub(course.classSub);
        setCourseNum(course.classNum);
      }
    };

    if (isProfile) updateCourse();
  }, [_review, isProfile]);

  /**
   * Initial call to check
   * 1. IF user is @loggedin
   * 2. IF logged in user has liked the review or not and updates @liked state.
   */
  useEffect(() => {
    const updateLiked = async () => {
      const response = await axios.post('/api/reviews/user-liked', {
        id: _review._id,
        token: getAuthToken()
      });

      setLiked(response.data.hasLiked);
    };

    if (isLoggedIn) updateLiked();
  }, [_review, isLoggedIn]);

  /** Renders course name as well if on profile page */
  const TitleAndProfessor = React.memo(() => {
    let professornames = _review.professors?.sort().join(', ') || 'Not Listed';

    return isProfile ? (
      <>
        <div className={previewstyle.coursetitle}>{courseTitle}</div>
        <div className={previewstyle.classprofessor}>
          {courseSub?.toUpperCase() +
            ' ' +
            courseNum?.toUpperCase() +
            ' | ' +
            professornames}
        </div>
      </>
    ) : (
      <div>
        Professor <span className={styles.bold}>{professornames}</span>
      </div>
    );
  });

  /* SEE MORE -> SEE LESS logic for lengthier reviews */
  const [expand, setExpand] = useState(false);
  const [seeMoreButton, setSeeMoreButton] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  /* BUG (?) 
    TODO: click read more -> shrink page -> "see less" option is gone. 
    Fix the logic to not do this? 
   */
  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setSeeMoreButton(ref.current.scrollHeight !== ref.current.clientHeight);
      }
    };
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /**
   * CSS ORDER LAYOUT:
   * card
   *  - metrics (overall, diff, workload)
   *  - content
   *    - prof
   *    - grade & major
   *    - review
   *    - see more button
   *    - date & helpful
   *    - covid?
   */
  return (
    <div className={`${styles.card} ${pending && previewstyle.pending}`}>
      <div className={styles.metrics}>
        <div>
          <span className={styles.metrictext}>Overall</span>
          <span className={styles.bold}>
            {_review.rating ? _review.rating : '-'}
          </span>
        </div>
        <div>
          <span className={styles.metrictext}>Difficulty</span>
          <span className={styles.bold}>
            {_review.difficulty ? _review.difficulty : '-'}
          </span>
        </div>
        <div>
          <span className={styles.metrictext}>Workload</span>
          <span className={styles.bold}>
            {_review.workload ? _review.workload : '-'}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <TitleAndProfessor />
        <div className={styles.grademajor}>
          <div>
            Grade{' '}
            <span className={styles.bold}>
              {_review.grade && /^([^0-9]*)$/.test(_review.grade)
                ? _review.grade
                : 'N/A'}
            </span>
          </div>
        </div>
        <div
          className={`${styles.reviewtext} ${!expand && styles.collapsedtext}`}
          ref={ref}
        >
          {_review.text}
        </div>
        {seeMoreButton && (
          <button
            className={styles.seemorebutton}
            onClick={() => setExpand(!expand)}
          >
            {expand ? 'See less' : '...See more'}
          </button>
        )}
        <div className={styles.datehelpful}>
          <div> {dateToString()} </div>
          <div className={`${styles.helpful} ${liked && styles.likedhelpful}`}>
            <img
              src={liked ? '/handClap_liked.svg' : '/handClap.svg'}
              alt={liked ? 'Liked' : 'Not Liked Yet'}
            />
            ({_review.likes ? _review.likes : 0}) Found this helpful
          </div>
        </div>
        {_review.isCovid && (
          <div className={styles.covid}>
            <span role="img" aria-label="alert"></span>
            My experience was affected by COVID-19.
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewReviewCard;

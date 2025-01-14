import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import { Review as ReviewType } from 'common';
import { convertSemAbbreviation } from 'common/CourseCard'

import styles from '../Styles/ReviewCard.module.css';

import { getAuthToken, useAuthOptionalLogin } from '../../../auth/auth_utils';
import { isCurrentSem } from 'common/CourseCard';

// use review.visible for pending

type ReviewProps = {
  review: ReviewType;
  isPreview: boolean;
  isProfile: boolean;
  reportHandler: (reviewId: string) => void;
};

/**
  Review Component.

  Simple styling component that renders a single review (an li element)
  to show in a ClassView. These reivews will include:
  - how long ago the reivew was added
  - all review content
  - report button
  - like button
*/
export default function ReviewCard({
  review,
  isPreview,
  isProfile,
  reportHandler
}: ReviewProps): React.JSX.Element {
  const { isLoggedIn, signIn } = useAuthOptionalLogin();
  const location = useLocation();

  const [_review, setReview] = useState<ReviewType>(review);
  const [liked, setLiked] = useState<boolean>(false);

  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseSub, setCourseSub] = useState<string>('');
  const [courseNum, setCourseNum] = useState<string>('');

  /** Turns our date objects into a string form to render. */
  function dateToString() {
    if (!_review.date) return '';

    const date = new Date(_review.date);
    let review_year = String(date.getFullYear()).substring(2);
    let review_month = date.getMonth() + 1;
    let review_day = date.getDate();

    return review_month + '/' + review_day + '/' + review_year;
  }

  /**
   * Shows user liked the review and updates DB count.
   */
  async function likeReview() {
    if (!isLoggedIn) {
      signIn('path:' + location.pathname);
    }

    setLiked((isLiked) => !isLiked);

    const response = await axios.post(`/api/reviews/update-liked`, {
      id: _review._id,
      token: getAuthToken()
    });

    setReview(response.data.review);
  }

  /**
   * Fetch the course information.
   */
  useEffect(() => {
    async function updateCourse() {
      const response = await axios.post(`/api/courses/get-by-id`, {
        courseId: _review.class
      });
      const course = response.data.result;

      setCourseTitle(course.classTitle);
      setCourseSub(course.classSub);
      setCourseNum(course.classNum);
    }

    if (isProfile) updateCourse();
  }, [_review, isProfile]);

  /**
   * Initial call to check
   * 1. IF user is @loggedin
   * 2. IF logged in user has liked the review or not and updates @liked state.
   */
  useEffect(() => {
    async function updateLiked() {
      const response = await axios.post('/api/reviews/user-liked', {
        id: _review._id,
        token: getAuthToken()
      });

      setLiked(response.data.hasLiked);
    }

    if (isLoggedIn) updateLiked();
  }, [_review, isLoggedIn]);

  /** Renders course name as well if on profile page */
  function TitleAndProfessor() {
    // list of professors (name1, name2, ..)
    let professornames = '';
    if (_review.professors && _review.professors.length > 0)
      professornames += _review.professors.join(', ');
    else professornames += 'N/A';

    if (isProfile) {
      return (
        <>
          <h5>{courseTitle}</h5>
          <p>
            {courseSub?.toUpperCase() +
              ' ' +
              courseNum?.toUpperCase() +
              ' | ' +
              professornames +
              (_review.semester
                ? ', ' + convertSemAbbreviation(_review.semester)
                : '')
            }
          </p>
        </>
      );
    } else {
      return (
        <div>
          Professor <span className={styles.bold}>{professornames}</span>
        </div>
      );
    }
  }

  /* SEE MORE -> SEE LESS logic for lengthier reviews */
  const [expand, setExpand] = useState(false);
  const [seeMoreButton, setSeeMoreButton] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  /* BUG (?) 
    TODO: click read more -> shrink page -> "see less" option is gone. 
    Fix the logic to not do this? 
   */
  useEffect(() => {
    function handleResize() {
      if (ref.current) {
        setSeeMoreButton(ref.current.scrollHeight !== ref.current.clientHeight);
      }
    }
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
    <div className={styles.card}>
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
                : _review.writtenDuringSemester ? 'Not sure yet' : 'N/A'
              }
            </span>
          </div>
          <div>
            Major{' '}
            <span className={styles.bold}>
              {_review.major && _review.major.length !== 0
                ? _review.major.map((major, index) => (
                    <span key={index}>
                      {index > 0 && ', '} {major}
                    </span>
                  ))
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
          {!isPreview && (
            <div className={styles.reporthelpful}>
              <button
                className={styles.report}
                onClick={() => reportHandler(_review._id)}
              >
                Report
              </button>

              <div
                className={`${styles.helpful} ${liked && styles.likedhelpful}`}
                onClick={likeReview}
              >
                <img
                  src={liked ? '/handClap_liked.svg' : '/handClap.svg'}
                  alt={liked ? 'Liked' : 'Not Liked Yet'}
                />
                {liked ? 'Liked!' : 'Helpful?'} (
                {_review.likes ? _review.likes : 0}){' '}
              </div>
            </div>
          )}
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
}

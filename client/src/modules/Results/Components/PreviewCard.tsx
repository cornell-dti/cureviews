import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { lastOfferedSems } from 'common/CourseCard';

import Gauges from '../../Course/Components/Gauges';
import { Review as ReviewType } from 'common';
import ReviewCard from '../../Course/Components/ReviewCard';

import styles from '../Styles/CoursePreview.module.css';
import { Class } from 'common';

import Bear from '/surprised_bear.svg';

const Review = ReviewCard;

export const PreviewCard = ({ course }: PreviewCardProps) => {
  const [id, setId] = useState('');
  const [rating, setRating] = useState('-');
  const [diff, setDiff] = useState('-');
  const [workload, setWorkload] = useState('-');
  const [topReview, setTopReview] = useState<ReviewType | {} | null>(null);
  const [numReviews, setNumReviews] = useState(0);
  const [topReviewLikes, setTopReviewLikes] = useState(0);
  const [offered, setOffered] = useState('');
  const [loading, setLoading] = useState(true);

  const updateCourseInfo = () => {
    if (course && course._id !== id) {
      setId(course._id);
      setRating(course.classRating ? String(course.classRating) : '-');
      setDiff(course.classDifficulty ? String(course.classDifficulty) : '-');
      setWorkload(course.classWorkload ? String(course.classWorkload) : '-');

      axios.post(`/api/courses/get-reviews`, { courseId: course ? course._id : id })
        .then((response) => {
          const reviews = response.data.result;
          if (reviews && reviews.length > 0) {
            reviews.sort((a: ReviewType, b: ReviewType) =>
              (a.likes || 0) < (b.likes || 0) ? 1 : -1
            );
            setTopReview(reviews[0]);
            setTopReviewLikes(reviews[0].likes || 0);
            setNumReviews(reviews.length);
            setOffered(lastOfferedSems(course));
          } else {
            setTopReview({});
            setNumReviews(0);
          }
          setLoading(false);
        });
    }
  }

  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    updateCourseInfo();
  }, [course, updateCourseInfo]);

  if (!course) return (<></>);

  return !loading && (
    <div className={styles.container}>
      <div>
        <div className={styles.coursetitle}>
          <a
            href={`/course/${course.classSub.toUpperCase()}/${course.classNum}`}
          >
            {course.classTitle}
          </a>
        </div>
        <div className={styles.subtitle}>
          {course.classSub.toUpperCase() +
            ' ' +
            course.classNum +
            ', ' +
            offered}
        </div>
      </div>

      <Gauges
        overall={parseFloat(rating)}
        difficulty={parseFloat(diff)}
        workload={parseFloat(workload)}
      />

      {numReviews !== 0 && <div className={styles.topreview}>Top Review</div>}

      <div className={styles.columns}>
        {numReviews !== 0 && (
          <Review
            key={(topReview as ReviewType)._id}
            review={topReview as ReviewType}
            reportHandler={() => null}
            isPreview={true}
            isProfile={false}
          />
        )}

        {numReviews !== 0 && numReviews > 1 && (
          <a
            className={styles.reviewsbutton}
            href={`/course/${course.classSub.toUpperCase()}/${course.classNum}`}
          >
            See {numReviews} more review{numReviews > 1 ? 's' : ''}
          </a>
        )}

        {numReviews === 0 && (
          <>
            <img src={Bear} alt="Bear Icon" className={styles.bearicon} />
            <div className={styles.noreviews}>
              No reviews yet! Why not be the first?
            </div>
          </>
        )}
        {(numReviews === 0 || numReviews === 1) && (
          <a
            className={styles.reviewsbutton}
            href={`/course/${course.classSub.toUpperCase()}/${course.classNum}`}
          >
            View course page
          </a>
        )}
      </div>
    </div>
  );
};

interface PreviewCardProps {
  course: Class;
}

export default PreviewCard;
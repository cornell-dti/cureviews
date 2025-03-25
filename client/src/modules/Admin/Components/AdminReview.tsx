import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Styles/AdminReview.module.css';
import { Review } from 'common';
import check from '../../../assets/icons/ic_round-check.svg';
import trash from '../../../assets/icons/Vector.svg';

type Props = {
  review: Review;
  approveHandler?: (review: Review) => void;
  removeHandler?: (review: Review, isUnapproved: boolean) => void;
  unReportHandler?: (review: Review) => void;
};

const UpdateReview = ({
  review,
  approveHandler,
  removeHandler,
  unReportHandler
}: Props) => {
  const [shortName, setShortName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    const getCourse = async () => {
      try {
        const response = await axios.post(`/api/courses/get-by-id`, {
          courseId: review.class
        });
        const course = response.data.result;
        if (course) {
          setShortName(`${course.classSub.toUpperCase()} ${course.classNum}`);
          setFullName(course.classTitle);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    getCourse();
  }, [review.class]);

  const renderButtons = (adminReview: Review) => {
    return adminReview.reported === 1 ? (
      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={styles.restoreButton}
          onClick={() => unReportHandler?.(adminReview)}
        >
          <img src={check} alt="Approve" className={styles.icon} />
          Restore Review
        </button>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => removeHandler?.(adminReview, false)}
        >
          <img src={trash} alt="Remove" className={styles.icon} />
          Remove Review
        </button>
      </div>
    ) : (
      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={styles.approveButton}
          onClick={() => approveHandler?.(adminReview)}
        >
          <img src={check} alt="Approve" className={styles.icon} />
          Confirm Review
        </button>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => removeHandler?.(adminReview, true)}
        >
          <img src={trash} alt="Remove" className={styles.icon} />
          Remove Review
        </button>
      </div>
    );
  };

  return (
    <div id={review._id} className={styles.reviewCard}>
      {/* Header */}
      <div className={styles.reviewHeader}>
        <span className={styles.reviewDate}>
          {review.date ? new Date(review.date).toLocaleDateString() : 'No Date'}
        </span>
        <div className={styles.reviewTitle}>
          <a href="#" className={styles.courseLink}>
            {shortName}, {fullName}
          </a>
          <p className={styles.professor}>
            Professor{' '}
            <span className={styles.professorName}>{review.professors}</span>
          </p>
        </div>
        <p className={styles.reviewMajor}>
          Major{' '}
          <span className={styles.majorText}>
            {Array.isArray(review.major)
              ? review.major.join(', ')
              : typeof review.major === 'string'
                ? (review.major as string).split(/[\s,;]+/).join(', ')
                : 'N/A'}
          </span>
        </p>
      </div>

      {/* Ratings */}
      <div className={styles.reviewRatings}>
        <p>
          <strong>Overall:</strong> {review.rating}
        </p>
        <p>
          <strong>Difficulty:</strong> {review.difficulty}
        </p>
        <p>
          <strong>Workload:</strong> {review.workload}
        </p>
      </div>

      {/* Review Text */}
      <div className={styles.reviewText}>
        <p>{review.text}</p>
      </div>

      {/* Divider */}
      <hr className={styles.divider} />

      {/* Buttons */}
      {renderButtons(review)}
    </div>
  );
};

export default UpdateReview;

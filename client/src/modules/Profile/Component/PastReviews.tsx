import React from 'react';

import styles from '../Styles/PastReviews.module.css';

import { Review as ReviewType } from 'common';
import CourseReviews from '../../Course/Components/CourseReviews';

type PastReviewsType = {
  pastReviews: ReviewType[];
};
const PastReviews = ({ pastReviews }: PastReviewsType) => {
  return (
    <>
      <div className={styles.header}>
        Approved Reviews ({pastReviews?.length})
      </div>
      <div className={styles.reviewcards}>
        <CourseReviews
          reviews={pastReviews}
          isPreview={false}
          isProfile={true}
        />
      </div>
    </>
  );
};

export { PastReviews };

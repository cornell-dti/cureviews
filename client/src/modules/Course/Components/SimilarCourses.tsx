import React from 'react';
import { Recommendation } from 'common';
import styles from '../Styles/SimilarCourses.module.css';
import SimilarCoursesCard from './SimilarCoursesCard';
import bear from '/profile_bear/profile_bear_white.svg';

const SimilarCoursesSection = ({
  similarCourses,
  isVisible
}: {
  similarCourses: Recommendation[] | undefined;
  isVisible: boolean;
}) => {
  if (!isVisible || !similarCourses || similarCourses.length === 0) return null;

  return (
    <div className={styles.similarCoursesSection}>
      <div className={styles.similarCoursesHeader}>
        <div className={styles.bear}>
          <img src={bear} alt="Profile Bear" />
        </div>
        <div className={styles.similarCoursesTitle}>Similar Courses</div>
      </div>
      <div className={styles.similarCoursesContainer}>
        {similarCourses?.map((course, index) => (
          <SimilarCoursesCard
            key={index}
            className={course.className}
            classSub={course.classSub}
            classNum={course.classNum}
            tags={course.tags}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarCoursesSection;

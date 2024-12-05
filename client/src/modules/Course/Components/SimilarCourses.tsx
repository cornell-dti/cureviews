import React from 'react';
import { Recommendation } from 'common';
import styles from '../Styles/SimilarCourses.module.css';
import SimilarCoursesCard from './SimilarCoursesCard';

const SimilarCoursesSection = ({
  similarCourses,
  bear,
  isVisible,
}: {
  similarCourses: Recommendation[] | undefined;
  bear: string;
  isVisible: boolean;
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={styles.similarCoursesSection}
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      <div className={styles.similarCoursesHeader}>
        <div className={styles.bear}>
          <img src={bear} alt="Profile Bear" />
        </div>
        <div className={styles.similarCoursesTitle}>
          Similar Courses
        </div>
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
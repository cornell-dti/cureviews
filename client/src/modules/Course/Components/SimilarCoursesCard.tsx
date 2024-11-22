import React, { useState, useEffect, useRef } from 'react';
import styles from '../Styles/SimilarCourses.module.css';

type SimilarCourses = {
  className: string;
  classSub: string;
  classNum: string;
  tags: string[];
};

export default function SimilarCoursesCard({
  className,
  classSub,
  classNum,
  tags
}: SimilarCourses): React.JSX.Element {

  const getTagStyling = (tag: string) => {
    if (tag.toLowerCase().includes('higher')) return styles.higher;
    if (tag.toLowerCase().includes('lower')) return styles.lower;
    return styles.similar;
  }
  return (
    <div className={styles.card}>
      <div className={styles.metrics}>
        <div className={styles.title}>{className}</div>
        <div className={styles.subtitle}>
          {classSub.toUpperCase()} {classNum}
        </div>
      </div>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <div key={index} className={`${styles.chip} ${getTagStyling(tag)}`}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  )
}
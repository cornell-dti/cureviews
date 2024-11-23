import React from 'react';
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
        <a
          href={`/course/${classSub.toUpperCase()}/${classNum
            }`}
          className={styles.title}
        >
          {className}
        </a>
        <div className={styles.subtitle}>
          {classSub.toUpperCase()} {classNum}
        </div>
      </div>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <div key={index} className={`${styles.chip} ${getTagStyling(tag)}`}>
            {tag.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </div>
        ))}
      </div>
    </div>
  )
}
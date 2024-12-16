import React, { useEffect, useState } from 'react';
import styles from '../Styles/SimilarCourses.module.css';
import axios from 'axios';
import { lastOfferedSems } from 'common/CourseCard';

type SimilarCourses = {
  className: string;
  classSub: string;
  classNum: string;
  tags: string[];
};

const SimilarCoursesCard: React.FC<SimilarCourses> = ({
  className,
  classSub,
  classNum,
  tags,
}) => {
  const [classSems, setClassSems] = useState('');

  const getTagStyling = (tag: string) => {
    if (tag.toLowerCase().includes('overall')) return styles.overall;
    if (tag.toLowerCase().includes('higher')) return styles.higher;
    if (tag.toLowerCase().includes('lower')) return styles.lower;
    return styles.similar;
  };

  useEffect(() => {
    const fetchClassSems = async () => {
      try {
        const response = await axios.post(`/api/courses/get-by-info`, {
          number: classNum,
          subject: classSub,
        });

        const course = response.data.result;
        if (course) {
          setClassSems(lastOfferedSems(course));
        }
      } catch (e) {
        console.error('Unable to fetch class semesters');
      }
    };

    fetchClassSems();
  }, [classNum, classSub]);

  return (
    <div className={styles.card}>
      <div className={styles.metrics}>
        <a
          href={`/course/${classSub.toUpperCase()}/${classNum}`}
          className={styles.title}
        >
          {className}
        </a>
        <div className={styles.subtitle}>
          {classSub.toUpperCase()} {classNum}, {classSems}
        </div>
      </div>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <div key={index} className={`${styles.chip} ${getTagStyling(tag)}`}>
            {tag
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarCoursesCard;

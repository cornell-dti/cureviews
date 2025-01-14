import React from 'react';
import { Class } from 'common';
import { lastOfferedSems } from 'common/CourseCard';
import styles from '../Styles/ResultList.module.css';

type Props = {
  course: Class;
  previewHandler: (arg1: any, arg2: any) => any;
  selected: boolean;
  index: number;
  sortBy: 'rating' | 'relevance' | 'diff' | 'work';
};

/**
  Filtered Result Component.

  Takes each result and creates a view of the result with its s

  @props 
  course- the class to be displayed
  previewHandler: if this class is clicked, this function will update
                  the selected class to display a PreviewCard
                  in the ResultsDisplay component to be itself
  selected: bool, if true, the border of this class is outlined blue to indicate being clicked
  index: number, the position of this class in the list of results
  sortBy: string, the metric to display on this component
*/

const FilteredResult = ({
  course,
  previewHandler,
  selected,
  index,
  sortBy
}: Props) => {
  /**
   * Returns the corresponding number of the class's metric based on the [sortBy] metric
   * Returns ? if it is null
   */
  function getSortNumber(roundTo?: number) {
    let sortNumber;
    if (sortBy === 'rating' || sortBy === 'relevance') {
      sortNumber = Number(course.classRating) ? course.classRating : '?';
    } else if (sortBy === 'diff') {
      sortNumber = Number(course.classDifficulty)
        ? course.classDifficulty
        : '?';
    } else if (sortBy === 'work') {
      sortNumber = Number(course.classWorkload) ? course.classWorkload : '?';
    }
    if (roundTo && Number(sortNumber)) {
      return Number(sortNumber).toFixed(roundTo);
    }
    return sortNumber;
  }

  //Returns the corresponding name of the class's metric based on the [sortBy] metric
  function updateSortNumberTitle() {
    if (sortBy === 'rating' || sortBy === 'relevance') {
      return 'Overall Rating';
    } else if (sortBy === 'diff') {
      return 'Difficulty';
    } else if (sortBy === 'work') {
      return 'Workload';
    }
    return '';
  }

  let theClass = course;
  let offered = lastOfferedSems(theClass);
  return (
    <div
      className={`${styles.card} ${selected && styles.selected}`}
      onClick={() => {
        previewHandler(course, index);
      }}
    >
      <div className="">
        <h1 className={styles.title}>
          <a href={`/course/${course.classSub.toUpperCase()}/${course.classNum}`}>
            {theClass.classTitle}
          </a>
        </h1>
        <h2 className={styles.subtitle}>
          {theClass.classSub.toUpperCase() +
            ' ' +
            theClass.classNum +
            ', ' +
            offered}
        </h2>
        <div className={styles.rating}>
          <strong>{updateSortNumberTitle()}: </strong>
          {getSortNumber(1)}/5
        </div>
      </div>
    </div>
  );
};

export default FilteredResult;

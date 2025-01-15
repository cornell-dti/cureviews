import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';

import Navbar from '../../Globals/Navbar';
import ResultsDisplay from './ResultsDisplay.js';

import styles from '../Styles/Results.module.css';

type ResultsProps = {
  match: {
    params: {
      input: string;
      type: string;
    };
  };
  history: any;
};

type ResultsLists = {
  courseList: any[];
  loading: boolean;
};

/**
 * Results Component
 * Used to render the results page. Uses Navbar and ResultsDisplay components directly.
 */
export const Results = ({match, history}: ResultsProps) => {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateResults = async () => {
    const response = await axios.post(`/api/search/get-courses`, {
      query: match.params.input.toLowerCase()
    });
    const list = response.data.result.courses;
    setCourseList(!list.error && list.length > 0 ? list : []);
    setLoading(false);
  }

  useEffect(() => {
    setCourseList([]);
    setLoading(true);
    updateResults();
  }, [match, history])

  const userInput = match.params.input.split('+').join(' ');
  return (
    <div className={styles.page}>
      <Navbar userInput={userInput} />

      <ResultsDisplay
        courses={courseList}
        // history={history}
        userInput={userInput}
        loading={loading}
        type={match.params.type}
      />
    </div>
  );
}

export default Results;
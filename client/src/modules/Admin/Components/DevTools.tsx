import React, { useState } from 'react';
import axios from 'axios';

import styles from '../Styles/DevTools.module.css';

interface AdminToolsProps {
  token: string;
}

export default function AdminTools({ token }: AdminToolsProps) {
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState<UpdateStatus>('empty');
  const [raffleStartDate, setRaffleStartDate] = useState('');
  const [raffleWinner, setRaffleWinner] = useState('');

  const messages = {
    empty: '',
    semester: 'New semester data successfully added',
    profsReset: 'Professor data successfully reset to empty',
    professors: 'Professor data successfully updated',
    description: 'Course description data successfully added',
    similarity: 'Similarity data successfully added',
    summarize: 'All courses successfully summarized',
    courseEval: 'Course evaluations successfully updated',
    subject: 'Full subject names successfully updated',
    failure: 'API may have failed, but endpoints time out on production. Check Heroku logs'
  };

  type UpdateStatus = keyof typeof messages;

  const handleApiCall = async (
    endpoint: string,
    successState: keyof typeof messages
  ) => {
    setUpdating(true);
    try {
      await axios.post(endpoint, { token });
      setUpdated(successState);
    } catch {
      setUpdated('failure');
    } finally {
      setUpdating(false);
    }
  };

  const raffleHandler = async () => {
    if (!raffleStartDate) return;
    setUpdating(true);
    try {
      const response = await axios.post('/api/admin/draw-raffle', {
        token,
        start: new Date(raffleStartDate)
      });
      if (response.status === 200) setRaffleWinner(response.data.netid);
      else setUpdated('failure');
    } catch {
      setUpdated('failure');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.adminWrapper}>
      <h1>Developer Tools</h1>
      <div className={styles.buttonGroup}>
        For semesterly updates:
        <button
          onClick={() => handleApiCall('/api/admin/semester/add', 'semester')}
          disabled={updating}
          className={styles.adminButton}
        >
          Add New Semester
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/admin/professors/add', 'professors')
          }
          disabled={updating}
          className={styles.adminButton}
        >
          Update Professors
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/admin/professors/reset', 'profsReset')
          }
          disabled={updating}
          className={styles.adminButton}
        >
          Reset Professors
        </button>
      </div>

      <div className={styles.buttonGroup}>
        For specific features:
        <button
          onClick={() => handleApiCall('/api/admin/courses/add-course-evals', 'courseEval')}
          disabled={updating}
          className={styles.adminButton}
        >
          Add Course Evals
        </button>
        <button
          onClick={() => handleApiCall('/api/admin/subjects/update', 'subject')}
          disabled={updating}
          className={styles.adminButton}
        >
          Update Full Subject Names
        </button>
        <button
          onClick={() => handleApiCall('/api/admin/course/desc', 'description')}
          disabled={updating}
          className={styles.adminButton}
        >
          Update Course Descriptions (Similarity)
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/admin/rec/similarity', 'similarity')
          }
          disabled={updating}
          className={styles.adminButton}
        >
          Generate Similar Courses
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/ai/summarize-courses', 'summarize')
          }
          disabled={updating}
          className={styles.adminButton}
        >
          Update Cornellians Say
        </button>
      </div>

      <div className={styles.raffleTitle}>
        <h2>Pick a raffle winner</h2>
        <label className={styles.raffleSection}>
          Select a raffle start date:
          <input
            type="date"
            value={raffleStartDate}
            onChange={(e) => setRaffleStartDate(e.target.value)}
            className={styles.selectDate}
          />
          <button
            onClick={raffleHandler}
            disabled={updating}
            className={styles.adminButton}
          >
            Draw Raffle Winner
          </button>
        </label>
        {raffleWinner && <p>Winner: {raffleWinner}</p>}
      </div>

      <div className={styles.updateSection}>
        {updating && <p>Updating... Please wait.</p>}
        {updated !== 'empty' && <p>{messages[updated]}</p>}
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';

import styles from '../Styles/Admin.module.css';

interface AdminToolsProps {
  token: string;
}

export default function AdminTools({ token }: AdminToolsProps) {
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState<UpdateStatus>('empty');
  const [raffleStartDate, setRaffleStartDate] = useState('');
  const [raffleWinner, setRaffleWinner] = useState('');
  const [doubleClick, setDoubleClick] = useState(false);

  const messages = {
    empty: '',
    semester: 'New semester data successfully added',
    profsReset: 'Professor data successfully reset to empty',
    professors: 'Professor data successfully updated',
    subjects: 'Subject full name data successfully updated',
    database: 'Database successfully initialized',
    description: 'Course description data successfully added',
    similarity: 'Similarity data successfully added',
    summarize: 'All courses successfully summarized',
    failure: 'API failed'
  };

  type UpdateStatus = keyof typeof messages;

  const handleApiCall = async (
    endpoint: string,
    successState: keyof typeof messages
  ) => {
    setUpdating(true);
    try {
      const response = await axios.post(endpoint, { token });
      if (response.status === 200) setUpdated(successState);
      else setUpdated('failure');
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

  const initDatabaseHandler = () => {
    if (doubleClick) handleApiCall('/api/admin/db/initialize', 'database');
    else {
      alert(
        'Warning! Clicking again will reset all data in the database. Are you sure?'
      );
      setDoubleClick(true);
    }
  };

  return (
    <div className={styles.adminWrapper}>
      <h1>Developer Tools</h1>
      <div className={styles.buttonGroup}>
        <button
          onClick={() => handleApiCall('/api/admin/semester/add', 'semester')}
          disabled={updating}
          className={styles.adminButtons}
        >
          Add New Semester
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/admin/professors/add', 'professors')
          }
          disabled={updating}
          className={styles.adminButtons}
        >
          Update Professors
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/admin/professors/reset', 'profsReset')
          }
          disabled={updating}
          className={styles.adminButtons}
        >
          Reset Professors
        </button>
        <button
          onClick={() => handleApiCall('/api/admin/course/desc', 'description')}
          disabled={updating}
          className={styles.adminButtons}
        >
          Update Descriptions
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/admin/subjects/update', 'subjects')
          }
          disabled={updating}
          className={styles.adminButtons}
        >
          Update Subjects
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/ai/summarize-courses', 'summarize')
          }
          disabled={updating}
          className={styles.adminButtons}
        >
          Summarize Reviews
        </button>
        <button
          onClick={() =>
            handleApiCall('/api/admin/rec/similarity', 'similarity')
          }
          disabled={updating}
          className={styles.adminButtons}
        >
          Update Similarity Data
        </button>
        <button
          onClick={initDatabaseHandler}
          disabled={updating}
          className={styles.adminButtons}
        >
          Initialize Database
        </button>
      </div>

      <div className={styles.raffleSection}>
        <h2>Raffle</h2>
        <label>
          Raffle Start Date:
          <input
            type="date"
            value={raffleStartDate}
            onChange={(e) => setRaffleStartDate(e.target.value)}
          />
        </label>
        <button
          onClick={raffleHandler}
          disabled={updating}
          className={styles.adminButtons}
        >
          Draw Raffle Winner
        </button>
        {raffleWinner && <p>Winner: {raffleWinner}</p>}
      </div>

      {updated !== 'empty' && (
        <div className={styles.updateMessage}>{messages[updated]}</div>
      )}
      {updating && <p>Updating... Please wait.</p>}
    </div>
  );
}

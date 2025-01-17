import React, { useEffect, useState } from 'react';
import styles from '../Styles/UserInfo.module.css';
import ProfileCard from './ProfileCard';
import MultiSelect from '../../Course/Components/MultiSelect';
import allMajors from '../../Globals/majors';
import axios from 'axios';
import { toast } from 'react-toastify';

type UserInfoProps = {
  profilePicture: string;
  reviewsTotal: number;
  upvoteCount: number;
  netId: string;
  majors: string[];
  signOut: () => void;
}

const UserInfo = ({
  profilePicture,
  upvoteCount,
  reviewsTotal,
  netId,
  signOut
}: UserInfoProps) => {
  const majorOptions: string[] = allMajors;
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [validMajor, setValidMajor] = useState<boolean>(false);
  const [userMajors, setUserMajors] = useState<string[]>([]);
  const [showMajorUpdate, setShowMajorUpdate] = useState<boolean>(false);

  useEffect(() => {
    getUserMajors();
  }, []);

  const onMajorSelectionChange = (newSelectedMajors: string[]) => {
    setSelectedMajors(newSelectedMajors);
    setValidMajor(JSON.stringify(newSelectedMajors) !== JSON.stringify(userMajors));
  }

  const getUserMajors = async () => {
    const response = await axios.post('/api/profiles/get-majors', { netId })
    if (response.status === 200) {
      setUserMajors(response.data.majors)
    }
  }

  const updateMajors = async () => {
    const response = await axios.post('/api/profiles/set-majors', { netId, majors: selectedMajors })
    console.log(response)
    if (response.status === 200) {
      setUserMajors(selectedMajors)
      setShowMajorUpdate(false)
      toast.success(
        "Majors successfully updated!"
      );
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>My Dashboard</div>
      <img
        className={styles.profileimage}
        src={profilePicture}
        alt="user profile bear"
      />
      <div className={styles.netid}>{netId}</div>
      {userMajors.length > 0 &&
        'Major' + (userMajors.length > 1 ? 's' : '') + ': ' + userMajors.join(', ')}
      <div className={styles.subtitle}>User Statistics</div>
      <div className={styles.statssection}>
        <ProfileCard
          title="Reviews"
          value={reviewsTotal}
          image="/total_reviews_icon.svg"
        />
        <ProfileCard
          title="Upvotes"
          value={upvoteCount}
          image="/helpful_review_icon.svg"
        ></ProfileCard>
      </div>
      {!showMajorUpdate && (
        <button
          className={styles.btn}
          onClick={() => setShowMajorUpdate(true)}
        >
          {userMajors.length === 0 ? "Set your major(s)" : "Update your major(s)"}
        </button>
      )}
      {showMajorUpdate && (
        <div>
          <MultiSelect
            options={majorOptions}
            value={selectedMajors}
            onChange={onMajorSelectionChange}
            preselectedOptions={userMajors}
            placeholder="Major"
          />
          <div className={styles.halfsizebuttons}>
            <button
              className={styles.btn}
              onClick={updateMajors}
              disabled={!validMajor}
              title={validMajor ? "" : "Majors have not been changed"}
            >
              {(selectedMajors.length === 0 && validMajor) ? "Submit (clear)" : "Submit"}
            </button>
            <button className={styles.btn} onClick={() => setShowMajorUpdate(false)}>
              Close menu
            </button>
          </div>
        </div>
      )}
      <button className={styles.btn} onClick={signOut}>
        Log Out
      </button>
    </div>
  );
};

export { UserInfo };

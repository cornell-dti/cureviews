import React from 'react';

import styles from '../Styles/AnonymousWarning.module.css';

import Emoji from '../../../assets/img/you-got-this-emoji.png';
import { useAuthOptionalLogin } from '../../../auth/auth_utils';
import { useHistory } from 'react-router-dom';

type Props = {
  open: boolean;
};

const LoginModal = ({ open }: Props) => {
  const { signIn } = useAuthOptionalLogin();
  if (!open) {
    return <></>;
  }

  /**
   * Should only render when the user is not signed in
   */
  return (
    <div className={styles.warningContainer}>
      <div className={styles.emoji}>
        <img
          src={Emoji}
          className="emoji"
          alt="CUReviews Bear -- 'You got this!' emoji"
        />
      </div>
      <div className={styles.message}>
        <span className="line1">
          Login to submit - your review will upload once you login!
          <br />
        </span>{' '}
      </div>
      <button
        className={`${styles.button}`}
        onClick={() => signIn('profile')}
      >
        Login
      </button>
      <div className={styles.pastReviewsMessage}>
        You will be redirected to your past reviews page
      </div>
    </div>
  );
};

export default LoginModal;

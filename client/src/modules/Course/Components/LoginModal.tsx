import React from 'react';
import styles from '../Styles/LoginModal.module.css';
import Emoji from '/login_modal_bear.svg';
import { useAuthOptionalLogin } from '../../../auth/auth_utils';

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
      <img
        src={Emoji}
        className={styles.emoji}
        alt="CUReviews Bear -- 'You got this!' emoji"
      />
      <div className={styles.message}>
        <span className="line1">
          Your review will upload once you login!
          <br />
        </span>{' '}
      </div>
      <button className={`${styles.button}`} onClick={() => signIn('profile')}>
        Login
      </button>
      <div className={styles.pastReviewsMessage}>
        You will be redirected to your past reviews page
      </div>
    </div>
  );
};

export default LoginModal;

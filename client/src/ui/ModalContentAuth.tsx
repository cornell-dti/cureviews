import React from "react";
import CUreviewsGoogleLogin from "./CUreviewsGoogleLogin";
import styles from "./css/ModalContentAuth.module.css";

export default function ModalContentAuth() {
  return (
    <>
      <img
        src="/logo.svg"
        className={`img-responsive center-block ${styles.logo}`}
        id="img-padding-top"
        alt="CU Reviews Logo"
      />
      <p className={styles.title}>You're almost there!</p>
      <p className={styles.text}>
        Log in with your <code>cornell.edu</code> account to verify you are a
        student.
      </p>
      <p className={styles.text}>
        (Don’t worry, your identity will always be kept secret!)
      </p>
      <CUreviewsGoogleLogin
        executeLogin={true}
        waitTime={1000}
        redirectFrom="course"
      />
    </>
  );
}

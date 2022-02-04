import React from "react";
import CUreviewsGoogleLogin from "./CUreviewsGoogleLogin";
import styles from "./css/ModalContentAuth.module.css";

export default function ModalContentAuth() {
  return (
    <>
      <div className={styles.logo}>
        <img src="/logo.svg" className="img-fluid" alt="CU Reviews Logo" />
      </div>
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

import React, { useState, useEffect, useRef } from "react";
import styles from "../ui/css/ProfileDropdown.module.css";
import { randomPicture } from "../util/profile_picture";

export default function ProfileDropdown(props) {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const toggling = () => setOpen(!open);
  const profilePicture = randomPicture(props.netId);

  useEffect(() => {
    const pageClickEvent = (e) => {
      if (dropdownRef.current !== null && dropdownRef.current.contains(e.target)) {
        setOpen(!open);
      }
    };

    if (open) {
      window.addEventListener("click", pageClickEvent);
    }

    return () => {
      window.removeEventListener("click", pageClickEvent);
    };
  }, [open]);

  return (
    <div className={styles.profileMenuContainer}>
      <img
        src={profilePicture}
        alt='profile bear'
        className={styles.profileBear}
        ref={dropdownRef}
        onClick={toggling}
      />

      {open ? (
        <div className={styles.profileMenuCard}>
          <a href='/profile' className={styles.profileMenuLink}>
            My Reviews
          </a>
          <button className={styles.profileMenuSignOutButton} onClick={props.signOut}>Sign Out</button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

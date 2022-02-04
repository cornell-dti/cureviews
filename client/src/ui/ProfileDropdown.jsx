import React, { useState, useEffect, useRef } from "react";

import styles from "../ui/css/ProfileDropdown.module.css";

export default function ProfileDropdown() {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const toggling = () => setOpen(!open);

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
        src='/profile_bear.png'
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
          <a href='/classes' className={styles.profileMenuLink}>
            Watched Classes
          </a>
          <button className={styles.profileMenuSignOutButton}>Sign Out</button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

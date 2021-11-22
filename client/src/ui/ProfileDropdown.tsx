import React, { useState, useEffect, useRef } from "react";

import styles from "../ui/css/ProfileDropdown.module.css";

export default function ProfileDropdown() {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const toggling = () => setOpen(!open);

  useEffect(() => {
    const pageClickEvent = () => {
      if (dropdownRef.current !== null) {
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
      <div onClick={toggling} className={styles.profileMenuTrigger}>
        <img
          src='/profile_bear.png'
          alt='profile bear'
          className={styles.profileBear}
        />
      </div>

      {open ? (
        <div ref={dropdownRef} className={styles.profileMenuCard}>
          <a href='/profile' className={styles.profileMenuLink}>
            My Reviews
          </a>
          <a href='/classes' className={styles.profileMenuLink}>
            Watched Classes
          </a>
          <button className={styles.profileMenuSignOutButton}>Sign Out</button>{" "}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

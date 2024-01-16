import React, { useState, useEffect, useRef } from 'react'
import { randomPicture } from './profile_picture'
import styles from './Styles/ProfileDropdown.module.css'

export default function ProfileDropdown(props) {
  const dropdownRef = useRef(null)
  const [open, setOpen] = useState(false)
  const toggling = () => setOpen(!open)
  const profilePicture = randomPicture(props.netId)

  useEffect(() => {
    const pageClickEvent = (e) => {
      if (
        dropdownRef.current !== null &&
        dropdownRef.current.contains(e.target)
      ) {
        setOpen(!open)
      }
    }

    if (open) {
      window.addEventListener('click', pageClickEvent)
    }

    return () => {
      window.removeEventListener('click', pageClickEvent)
    }
  }, [open])

  return props.isLoggedIn ? (
    <div className={styles.profileMenuContainer}>
      <img
        src={profilePicture}
        alt="profile bear"
        className={styles.profileBear}
        ref={dropdownRef}
        onClick={toggling}
      />

      {open ? (
        <div className={styles.profileMenuCard}>
          <a href="/profile" className={styles.profileMenuLink}>
            My Reviews
          </a>
          <button
            className={styles.profileMenuSignOutButton}
            onClick={props.signOut}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  ) : (
    <button
      type="button"
      className={`${styles.signInButton}`}
      onClick={() => {
        props.signIn('home')
      }}
    >
      Sign In
    </button>
  )
}

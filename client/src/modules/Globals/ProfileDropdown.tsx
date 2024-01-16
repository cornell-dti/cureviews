import React, { useState, useEffect, useRef } from 'react'
import { randomPicture } from './profile_picture'
import styles from './Styles/ProfileDropdown.module.css'

type ProfileDropdownProps = {
  netId: string
  isLoggedIn: boolean
  signIn: Function
  signOut: Function
}

export default function ProfileDropdown({
  netId,
  isLoggedIn,
  signIn,
  signOut,
}: ProfileDropdownProps) {
  const dropdownRef = useRef(null)
  const [open, setOpen] = useState(false)
  const toggling = () => setOpen(!open)
  const profilePicture = randomPicture(netId)

  useEffect(() => {
    const pageClickEvent = (e: { target: any }) => {
      console.log(dropdownRef.current)
      if (dropdownRef.current !== null) {
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

  return isLoggedIn ? (
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
          <div>
            <a href="/profile" className={styles.profileMenuLink}>
              My Reviews
            </a>
          </div>

          <div className={`${styles.signOutButtonContainer}`}>
            <button
              className={`${styles.profileMenuSignOutButton}`}
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </div>
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
        signIn('home')
      }}
    >
      Sign In
    </button>
  )
}

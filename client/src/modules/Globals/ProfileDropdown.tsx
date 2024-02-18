import React, { useState, useEffect, useRef } from 'react'
import { randomPicture } from './profile_picture'
import styles from './Styles/ProfileDropdown.module.css'

import LogOutIcon from '../../assets/icons/logout.svg'
import ReviewsIcon from '../../assets/icons/review.svg'

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

  if (!isLoggedIn)
    return (
      <button
        type="button"
        className={`${styles.signinbutton}`}
        onClick={() => {
          signIn('home')
        }}
      >
        Login
      </button>
    )

  return (
    <div className={styles.profile}>
      <img
        src={profilePicture}
        alt="profile bear"
        className={styles.bear}
        ref={dropdownRef}
        onClick={toggling}
      />

      {open && (
        <div className={styles.profiledropdown}>
          <div className={styles.option}>
            <a href="/profile">
              My Reviews
              <img
                className={styles.optionimg}
                src={ReviewsIcon}
                alt="my-reviews"
              />
            </a>
          </div>

          <div
            className={`${styles.option} ${styles.logout}`}
            onClick={() => signOut()}
          >
            Log Out
            <img className={styles.optionimg} src={LogOutIcon} alt="log-out" />
          </div>
        </div>
      )}
    </div>
  )
}

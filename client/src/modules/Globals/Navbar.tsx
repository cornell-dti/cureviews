import React from 'react';
import { useLocation } from 'react-router-dom';

import { SearchBar } from '../SearchBar';
import ProfileDropdown from './ProfileDropdown';

import { useAuthOptionalLogin } from '../../auth/auth_utils';
import { Session } from '../../session-store';

import styles from './Styles/NavBar.module.css';

/*
  Navbar Component. Short description if needed.

  Identify as one of the following components:
  Simple styling: mainly renders HTML and CSS,
  Container: combines multiple components into a single feature
  View: top-level component accessed by a URL endpoint defined by the router in main.jsx

  Include a breif description of the component's purpose, where it falls in the
  component tree, and any inportant information it accesses or modifies.
  Include the route for View components.
*/

type NavbarProps = {
  userInput: string;
  showSearchBar?: boolean;
};

export default function Navbar({
  userInput,
  showSearchBar = true
}: NavbarProps) {
  const { netId, signIn, signOut } = useAuthOptionalLogin();
  const location = useLocation();

  /** Show Profile DropDown  */
  function displayButton() {
    const token = Session.get('token');
    return (
      <ProfileDropdown
        netId={`${netId}`}
        isLoggedIn={token}
        signOut={() => {
          if (['/profile'].includes(location.pathname)) {
            signOut('/');
          }
          signOut();
        }}
        signIn={signIn}
      />
    );
  }

  return (
    <div
      className={`${styles.navbarwrapper} ${!showSearchBar ? styles.withBorder : ''}`}
    >
      <div className={styles.navbar}>
        <a className="" href="/">
          <img src="/logo.svg" className={styles.logo} alt="CU Reviews Logo" />
        </a>
        {showSearchBar && (
          <div className={styles.searchbar}>
            <SearchBar
              userInput={userInput}
              contrastingResultsBackground={true}
              isInNavbar={true}
            />
          </div>
        )}
        <div className={styles.profileDropdown}>{displayButton()}</div>
      </div>
    </div>
  );
}

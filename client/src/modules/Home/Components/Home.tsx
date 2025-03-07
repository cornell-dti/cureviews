import React, { useEffect, useState } from 'react';

import { SearchBar } from '../../SearchBar';
import ProfileDropdown from '../../Globals/ProfileDropdown';

import { useAuthOptionalLogin } from '../../../auth/auth_utils';

import DTITextLogo from '../../../assets/img/dti-text-logo.png';
import DTIWhiteLogo from '../../../assets/img/dti-text-white-logo.png';

import styles from '../Home.module.css';

/**
  Home Page.

  Uppermost View component in the component tree, the first element of the HTML body tag grabbed by index.html.

  @returns the application homepage with a navbar and searchbar, popular
  classes and recent reviews components.

  @param imgSrc for search bar

*/
export const Home = () => {
  const { isLoggedIn, netId, signIn, signOut } = useAuthOptionalLogin();
  const [DTILogo, setDTILogo] = useState(DTITextLogo);
  const [season, setSeason] = useState('winter');
  const [time, setTime] = useState('afternoon');

  /** Logic for deciding the home pages' background image */
  function setBackground() {
    const sunsetStartTimes = [
      17.0, 17.5, 18, 19.5, 20, 20.5, 20.5, 19.5, 18.5, 18, 16.5, 16.5
    ];
    const sunsetEndTimes = [
      18.5, 19, 20.5, 21, 22, 22, 22, 21.5, 20.5, 20, 19, 18
    ];
    const date = new Date();
    const month = date.getMonth();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    let timeOfDay = hours;
    if (minutes > 30) {
      timeOfDay += 0.51;
    }
    if (month === 11 || month === 0 || month === 1) {
      setSeason('winter');
    } else if (month >= 2 && month <= 4) {
      setSeason('spring');
    } else if (month >= 5 && month <= 7) {
      setSeason('summer');
    } else {
      setSeason('fall');
    }

    if (timeOfDay < 6 || timeOfDay >= sunsetStartTimes[month]) {
      setTime('night');
    } else if (timeOfDay >= sunsetEndTimes[month]) {
      setTime('sunset');
    }
  }

  useEffect(() => {
    setBackground();
    if (time === 'night') {
      setDTILogo(DTIWhiteLogo);
    }
  }, [time, season]);

  return (
    <div
      className={`${styles.fullheight} ${styles.bgfixed} ${
        styles[`bg${time}${season}`]
      }`}
    >
      <div className={styles.buttoncontainer}>
        <ProfileDropdown
          isLoggedIn={isLoggedIn}
          netId={netId}
          signOut={signOut}
          signIn={signIn}
        />
      </div>

      <div className={styles.container}>
        <img
          src="/logo.svg"
          className={`${styles.logo}`}
          alt="CU Reviews Logo"
        />
        <p className={styles.header}>
          Search for Cornell courses, rate past classes, and share feedback
        </p>
        <div className={styles.searchcontainer}>
          <SearchBar isInNavbar={false} />
        </div>
      </div>

      {/* Logo:  */}
      <img src={DTILogo} className={styles.dtilogo} alt="DTI Logo" />
    </div>
  );
};

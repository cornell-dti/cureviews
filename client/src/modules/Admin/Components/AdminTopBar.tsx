import React from "react";
import styles from "../Styles/Admin.TopBar.module.css";
import logo from "../../../../public/logo.svg"; // Ensure the path to your logo is correct
import avatar from "../../../../public/profile_bear/profile_bear_light_pink.svg";

const TopBar = () => {
  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <img src={logo} alt="CU Reviews Logo" className={styles.logo} />
      </div>
      <div className={styles.right}>
        <img src={avatar} alt="User Avatar" className={styles.avatar} />
      </div>
    </header>
  );
};

export default TopBar;

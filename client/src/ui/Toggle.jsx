import React from "react";
import styles from "./css/Toggle.module.css";

export default ({ label, checked, onCheck }) => {
  return (
    <label className={`${styles.label} ${checked ? styles.labelChecked : ""}`}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={(event) => {
          // console.log(event.target.checked);
          onCheck(event.target.checked);
        }}
      />
      {label}
    </label>
    // <button
    //   className={`${styles.button} ${checked ? styles.checkedButton : ""}`}
    // >
    //   {label}
    // </button>
  );
};

import React from "react";
import styles from "./css/NotFound.module.css";

export default function NotFound() {
  return (
    <div className="col-12">
      <div>
        <div className={styles.notFoundMarginTop}></div>
      </div>
      <div className="text-center">
        <div className={styles.notFoundImage} >
          <img src="/noResults.svg" className="img-fluid" alt="No class found" height="100%"></img>
        </div>
        <div className={styles.notFound404Text}>404</div>
        <div className={styles.notFoundText}>Oops! Page Not Found :(</div>
      </div>
    </div >
  )
}

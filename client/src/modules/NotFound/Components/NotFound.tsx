import React from 'react'
import styles from '../NotFound.module.css'

const NotFound = () => {
  return (
    <div className="">
      <div>
        <div className={styles.notFoundMarginTop}></div>
      </div>
      <div className="">
        <div className={styles.notFoundImage}>
          <img
            src="/noResults.svg"
            className=""
            alt="No class found"
            height="100%"
          ></img>
        </div>
        <div className={styles.notFound404Text}>404</div>
        <div className={styles.notFoundText}>Oops! Page Not Found :(</div>
      </div>
    </div>
  )
}

export { NotFound }

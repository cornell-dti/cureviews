import React from 'react'
import styles from '../Styles/Results.module.css'

type Props = any

const FilterPopup = (props: Props) => {
  return (
    <div className={styles.filterpopup}>
      <div className={styles.categories}>
        <div className="">
          <div className={styles.filtercategory}>Semester</div>
          {props.renderCheckboxes('semesters')}
        </div>

        <div className="">
          <div className={styles.filtercategory}>Level</div>
          {props.renderCheckboxes('levels')}
        </div>
      </div>
      <button
        className={styles.donebutton}
        onClick={props.setShowFilterPopup}
      >
        Done
      </button>
    </div>
  )
}

export default FilterPopup
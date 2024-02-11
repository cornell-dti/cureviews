import React, { Component } from 'react'
import styles from '../Styles/Results.module.css'

type Props = any

export default class FilterPopup extends Component<Props, {}> {
  render() {
    return (
      <div className={styles.filterpopup}>
        <div className={styles.filtertext}>Filter</div>

        <div className={styles.categories}>
          <div className="">
            <div className={styles.filtercategory}>Semester</div>
            {this.props.renderCheckboxes('semesters')}
          </div>

          <div className="">
            <div className={styles.filtercategory}>Level</div>
            {this.props.renderCheckboxes('levels')}
          </div>
        </div>
        <button
          className={styles.donebutton}
          onClick={this.props.setShowFilterPopup}
        >
          Done
        </button>
      </div>
    )
  }
}

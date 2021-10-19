import React, { Component } from 'react';
import "./css/ResultsDisplay.css";

type Props = any

export default class FilterPopup extends Component<Props, {}> {
  render() {
    return (
      <div className="filter-popup">
        <div className="d-none d-xs-block d-lg-none filter-container" >

          <div>
            <input className="mobile-filter-done-button" type="button" value="DONE" onClick={this.props.setShowFilterPopup} />
          </div>

          <div className="filter-title">Filter</div>

          <div className="mobile-filter-box">
            <div className="filter-sub-category">
              <p className="filter-sub-title">Semester</p>
              {this.props.renderCheckboxes("semesters")}
            </div>
          </div>

          <div className="mobile-filter-box">
            <div className="filter-sub-category">
              <p className="filter-sub-title">Level</p>
              {this.props.renderCheckboxes("levels")}
            </div>
          </div>

        </div>
      </div>
    );
  }
}


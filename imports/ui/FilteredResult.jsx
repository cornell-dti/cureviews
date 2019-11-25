import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/FilteredResult.css';
import { lastOfferedSems } from './js/CourseCard.js';

/*
  Filtered Result Component.
*/

export default class FilteredResult extends Component {
  constructor(props) {
    super(props);
    // set gauge values
    this.state = {
      course: this.props.course,
      current_index: this.props.index,
      sortBy: this.props.sortBy
    };

    this.getColor = this.getColor.bind(this);
    this.updateSortBy = this.updateSortBy.bind(this);
    this.updateSortByTitle = this.updateSortByTitle.bind(this);

  }

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this.setState({
        course: this.props.course,
        current_index: this.props.index,
        sortBy: this.props.sortBy
      })
    }
  }

  getColor(metric, val) {
    if (metric === "Overall Rating") {
      if (3.0 <= val && val < 4.0) {
        return "#f9cc30";
      }
      else if (4.0 <= val && val <= 5.0) {
        return "#53B277";
      }
      else {
        return "#E64458";
      }
    }
    else if (metric === "Difficulty" || metric === "Workload") {
      if (3.0 <= val && val < 4.0) {
        return "#f9cc30";
      }
      else if ((4.0 <= val && val <= 5.0) || val == "-") {
        return "#E64458";
      }
      else {
        return "#53B277";
      }
    }
  }

  updateSortBy() {
    if (this.state.sortBy === "rating") {
      return this.state.course.classRating;
    }
    else if (this.state.sortBy === "diff") {
      return this.state.course.classDifficulty;
    }
    else if (this.state.sortBy === "work") {
      return this.state.course.classWorkload == null ? "-" : this.state.course.classWorkload;
    }
  }

  updateSortByTitle() {
    if (this.state.sortBy === "rating") {
      return "Overall Rating";
    }
    else if (this.state.sortBy === "diff") {
      return "Difficulty";
    }
    else if (this.state.sortBy === "work") {
      return "Workload";
    }
  }

  render() {
    let theClass = this.props.course;

    return (
      <li className="card" style={{ border: this.props.border_color }}
        onClick={() => { this.props.previewHandler(this.state.course, this.state.current_index) }}>
        <div className="card-body">
          <h1 className="card-title">
            <strong>{theClass.classTitle}</strong>
          </h1>
          <h2 className="card-subtitle mb-2 text-muted">
            {theClass.classSub.toUpperCase() + " " + theClass.classNum}
          </h2>
          <div>
            <p className="p-display">
              <strong>{this.updateSortByTitle()}</strong>
            </p>
            <p className="p-display" style={{ color: this.getColor(this.updateSortByTitle(), this.updateSortBy()) }}>
              {this.updateSortBy()}
            </p>
            <p className="p-display" id="over-5">
              /5
          </p>
          </div>
        </div>
      </li>
    );
  }
}


// takes in the database object representing this review
FilteredResult.propTypes = {
  course: PropTypes.object.isRequired,
  previewHandler: PropTypes.func.isRequired,
  border_color: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  sortBy: PropTypes.string.isRequired
};

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./css/ResultsDisplay.css"; // css files
import FilteredResult from './FilteredResult.jsx';
import PreviewCard from './PreviewCard.jsx';
import { lastOfferedSems } from './js/CourseCard.js';

/*
  Results Component. Short description if needed.

  Identify as one of the following components:
  Simple styling: mainly renders HTML and CSS,
  Container: combines multiple components into a single feature
  View: top-level component accessed by a URL endpoint defined by the router in main.jsx

  Include a breif description of the component's purpose, where it falls in the
  component tree, and any inportant information it accesses or modifies.
  Include the route for View components.
*/

export default class ResultsDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseList: this.props.courses,
      card_course: this.props.courses[0],
      active_card: 0,
      selected: "rating",
      filters: {
        "Fall": true, "Spring": true, 
        "1000": true, "2000": true,
        "3000": true, "4000": true, 
        "5000+": true
      }, // key value pair name:checked
      filteredItems: [],
      noResults: this.props.noResults
    };
    this.previewHandler = this.previewHandler.bind(this);
    this.sort = this.sort.bind(this);

  }

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this.setState({
        courseList: this.props.courses,
        card_course: this.props.courses[0],
        active_card: 0,
        selected: "rating",
        filters: {
          "Fall": true, "Spring": true, "1000": true, "2000": true,
          "3000": true, "4000": true, "5000+": true
        }, // key value pair => name:checked
        filteredItems: [],
        noResults: this.props.noResults
      })
    }
  }

  handleSelect = (event) => {
    let opt = event.target.value;
    this.setState({ selected: opt }, () => this.sort());
  }

  sort() {
    if (this.state.filteredItems.length == 0) {
      if (this.state.selected == "rating") {
        let data = this.state.courseList.sort((a, b) => (b.classRating - a.classRating));
        this.setState({
          courseList: data,
          card_course: data[0],
          active_card: 0
        });
      }
      else if (this.state.selected == "diff") {
        data = this.state.courseList.sort((a, b) => (a.classDifficulty - b.classDifficulty));
        this.setState({
          courseList: data,
          card_course: data[0],
          active_card: 0
        });

      }
      else if (this.state.selected == "work") {
        data = this.state.courseList.sort((a, b) =>
          ((a.classWorkload == null ? Number.MAX_SAFE_INTEGER : a.classWorkload) -
            (b.classWorkload == null ? Number.MAX_SAFE_INTEGER : b.classWorkload)));
        this.setState({
          courseList: data,
          card_course: data[0],
          active_card: 0
        });
      }
    }
    else {
      if (this.state.selected == "rating") {
        data = this.state.filteredItems.sort((a, b) => (b.classRating - a.classRating));
        this.setState({
          filteredItems: data,
          card_course: data[0],
          active_card: 0
        });
      }
      else if (this.state.selected == "diff") {
        data = this.state.filteredItems.sort((a, b) => (a.classDifficulty - b.classDifficulty));
        this.setState({
          filteredItems: data,
          card_course: data[0],
          active_card: 0
        });

      }
      else if (this.state.selected == "work") {
        data = this.state.filteredItems.sort((a, b) =>
          ((a.classWorkload == null ? Number.MAX_SAFE_INTEGER : a.classWorkload) -
            (b.classWorkload == null ? Number.MAX_SAFE_INTEGER : b.classWorkload)));
        this.setState({
          filteredItems: data,
          card_course: data[0],
          active_card: 0
        });
      }
    }

  }

  classLevelCheck(course, filterName) {
    let classLevel = course.classNum;
    let classLevelString = course.classNum.toString().substring(0, 1);
    let filterClassLevel = filterName.substring(0, 1);
    if (filterClassLevel == "5") {
      if (Math.floor(classLevel / 1000) >= 5) {
        return true;
      }
    }
    else if (classLevelString == filterClassLevel) {
      return true;
    }
    else {
      return false;
    }

  }

  filterCondition(course, activeFilters) {
    let sems = ["Fall", "Spring"];
    let classLevels = ["1000", "2000", "3000", "4000", "5000+"];
    const found = activeFilters.some(filterName => sems.includes(filterName)) &&
      activeFilters.some(filterName => classLevels.includes(filterName))
    if (found) {
      let foundSem = activeFilters.some(activeFilterName =>
        lastOfferedSems(course).includes(activeFilterName));
      let foundClassLevel = activeFilters.some(activeFilterName =>
        this.classLevelCheck(course, activeFilterName));
      return foundSem && foundClassLevel;
    }
    else {
      return activeFilters.some(
        activeFilterName => lastOfferedSems(course).includes(activeFilterName) ||
          this.classLevelCheck(course, activeFilterName)
      )
    }
  }

  onChange = e => {
    const name = e.target.name;
    const checked = e.target.checked;
    const filters = {
      ...this.state.filters,
      [name]: checked
    };

    const activeFilterNames = Object.keys(filters).filter(
      filterName => filters[filterName]
    );
    const filteredItems = this.state.courseList.filter(course =>
      this.filterCondition(course, activeFilterNames)
    );
    if (filteredItems.length == 0 && checked) {
      this.setState({
        filters: filters,
        filteredItems: filteredItems,
        noResults: true
      })
    }
    else if (checked) {
      this.setState({
        filters: filters,
        filteredItems: filteredItems,
        card_course: filteredItems[0],
        noResults: false
      }, () => this.sort());
    }
    else {
      this.setState({
        filters: filters,
        filteredItems: filteredItems,
        card_course: this.state.courseList[0],
        noResults: false
      }, () => this.sort());
    }

  }

  previewHandler(course, index) {
    this.setState({
      card_course: course,
      active_card: index
    });
  }

  renderResults() {
    const items = this.state.filteredItems.length
      ? this.state.filteredItems
      : this.state.courseList;
    return items.map((result, index) => (
      <FilteredResult key={index} index={index}
        border_color={index == this.state.active_card ? "solid 1px #4a90e2" : "solid 0.5px #d8d8d8"}
        course={result} previewHandler={this.previewHandler}
        sortBy={this.state.selected} />
    ));

  }

  renderSemesterCheckboxes() {
    let sems = ["Fall", "Spring"];
    return sems.map((name, index) => (
      <div key={index}>
        <input
          onChange={(e) => this.onChange(e)}
          type="checkbox"
          checked={this.state.filters[name]}
          name={name}
        />
        <label className="checkbox-label">{name} </label>
      </div>
    ))

  }

  renderClassLevelCheckBoxes() {
    let classLevels = ["1000", "2000", "3000", "4000", "5000+"];
    return classLevels.map((name, index) => (
      <div key={index}>
        <input
          onChange={(e) => this.onChange(e)}
          type="checkbox"
          checked={this.state.filters[name]}
          name={name}
        />
        <label className="checkbox-label">{name}</label>
      </div>
    ))
  }

  render() {
    if (!this.state.noResults) {
      return (
        <div className="row margin-top">
          <div className="col-md-2 col-sm-2 col-xs-2" id="filters" >
            <p className="overall-filter">Filter</p>
            <div className="filter-sub">
              <p className="filter-title"> Semester</p>
              {this.renderSemesterCheckboxes()}
            </div>
            <div className="filter-sub">
              <p className="filter-title">Level</p>
              {this.renderClassLevelCheckBoxes()}
            </div>
          </div>
          <div className="col-md-5 col-sm-5 col-xs-5" id="results">
            <div className="row">
              <div className="col-md-5 col-sm-5 col-xs-5">
                <p className="num-classes-found">We found <strong>{this.props.courses.length}</strong> courses</p>
              </div>
              <div className="col-md-7 col-sm-7 col-xs-7 display-inline">
                <p className="sort-by">
                  Sort By:
                </p>
                <select className="browser-default" onChange={(e) => this.handleSelect(e)}>
                    <option value="rating">Overall Rating</option>
                    <option value="diff" >Difficulty</option>
                    <option value="work">Workload</option>
                  </select>
                </div>
              </div>
              <ul>
                {this.renderResults()}
              </ul>
            </div>
          <div></div>
          <div className="col-md-5 col-sm-5 col-xs-5" id="preview">
            <PreviewCard course={this.state.card_course} />
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="row">
          <div className="col-md-2 col-sm-2 col-xs-2" id="filters" >
            <p className="overall-filter">Filter</p>
            <div className="filter-sub">
              <p className="filter-title"> Semester</p>
              {this.renderSemesterCheckboxes()}
            </div>
            <div className="filter-sub">
              <p className="filter-title">Level</p>
              {this.renderClassLevelCheckBoxes()}
            </div>
          </div>
          <div className="col-md-4 col-sm-4 col-xs-4" id="results">
            <div className="sort-by">
              Sort By:
              <select className="browser-default custom-select" onChange={(e) => this.handleSelect(e)}>
                <option value="rating">Overall Rating</option>
                <option value="diff" >Difficulty</option>
                <option value="work">Workload</option>
              </select>
            </div>
            <div>
              Sorry! No classes matched your search.
            </div>
          </div>
        </div>
      )
    }
  }
}

ResultsDisplay.propTypes = {
  courses: PropTypes.array.isRequired,
  noResults: PropTypes.bool.isRequired
};


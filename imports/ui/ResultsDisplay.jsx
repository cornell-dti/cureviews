import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./css/ResultsDisplay.css"; // css files
import FilteredResult from './FilteredResult.jsx';
import PreviewCard from './PreviewCard.jsx';
import { lastOfferedSems } from './js/CourseCard.js';
import Loading from 'react-loading-animation';


/*
  ResultsDisplay Component.

  Used by Results component, renders filters,
  list of class objects (results), and PreviewCard.

  Props:  courses - is a list of class objects
          loading - bool, true if back-end has no returned from search yet

*/

export default class ResultsDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseList: this.props.courses,
      card_course: this.props.courses[0],
      active_card: 0,
      selected: props.type === "major" ? "rating" : "relevance",
      filters: {
        "Fall": true, "Spring": true,
        "1000": true, "2000": true,
        "3000": true, "4000": true,
        "5000+": true
      }, // key value pair name:checked
      filteredItems: this.props.courses
    };
    this.previewHandler = this.previewHandler.bind(this);
    this.sortBy = this.sortBy.bind(this);
    this.sort = this.sort.bind(this);

  }


  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this.setState({
        courseList: this.props.courses,
        relevantCourseList: this.props.courses,
        card_course: this.props.courses[0],
        active_card: 0,
        selected: this.props.type === "major" ? "rating" : "relevance",
        filters: {
          "Fall": true, "Spring": true, "1000": true, "2000": true,
          "3000": true, "4000": true, "5000+": true
        }, // key value pair => name:checked
        filteredItems: this.props.courses
      }, () => this.sort())
    }
  }

  // Handles selecting different sort bys
  handleSelect = (event) => {
    let opt = event.target.value;
    this.setState({ selected: opt }, () => this.sort());
  }

  // Helper function to sort()
  sortBy(courseList, sortByField, fieldDefault, increasing){
    const data = courseList.sort(
      (a, b) => {
        let first = (Number(b[sortByField]) || fieldDefault);
        let second = (Number(a[sortByField]) || fieldDefault);

        if (first === second) {
          return (a.classNum - b.classNum);
        }
        else {
          if(increasing){
            return (first - second);
          }
          else{
            return (second - first);
          }

        }
      });
    this.setState({
      courseList: data,
      card_course: data[0],
      active_card: 0
    });
  }

  // Sorts list of class results by category selected in this.state.selected
  sort() {
    let availableClasses;
    if (this.state.filteredItems.length == 0){
      availableClasses = this.state.courseList;
    }
    else{
      availableClasses = this.state.filteredItems;
    }

    if (this.state.selected == "relevance"){
      this.sortBy(availableClasses, "score", 0, true);
    }
    else if (this.state.selected == "rating"){
      this.sortBy(availableClasses, "classRating", 0, true);
    }
    else if (this.state.selected == "diff"){
      this.sortBy(availableClasses, "classDifficulty", Number.MAX_SAFE_INTEGER, false);
    }
    else if (this.state.selected == "work"){
      this.sortBy(availableClasses, "classWorkload", Number.MAX_SAFE_INTEGER, false);
    }
  }

  //Returns true if the [course]'s class level falls under the filter [filterName]
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

  //Returns true if the [course] falls under the [activeFilters]
  filterCondition(course, activeFilters) {
    let sems = ["Fall", "Spring"];
    let classLevels = ["1000", "2000", "3000", "4000", "5000+"];

    //checks if the filters checked are across both the semester and classLevel categories
    const found = activeFilters.some(filterName => sems.includes(filterName)) &&
      activeFilters.some(filterName => classLevels.includes(filterName))
    if (found) {
      let foundSem = activeFilters.some(activeFilterName =>
        lastOfferedSems(course).includes(activeFilterName));
      let foundClassLevel = activeFilters.some(activeFilterName =>
        this.classLevelCheck(course, activeFilterName));
      return foundSem && foundClassLevel; //returns true if the course satsifies any of the filters for BOTH categories
    }
    else {
      return activeFilters.some(
        activeFilterName => lastOfferedSems(course).includes(activeFilterName) ||
          this.classLevelCheck(course, activeFilterName) //returns true if the course satsifies any of the filters for one of the categories
      )
    }
  }

  //Updates the list of filtered items when filters are checked/unchecked
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
    let list = this.state.courseList;
    if (this.state.selected === "relevance") {
      list = this.state.relevantCourseList;
    }
    const filteredItems = list.filter(course =>
      this.filterCondition(course, activeFilterNames)
    );
    if (filteredItems.length == 0 && checked) {
      this.setState({
        filters: filters,
        filteredItems: filteredItems,
      })
    }
    else if (checked) {
      this.setState({
        filters: filters,
        filteredItems: filteredItems,
        card_course: filteredItems[0],
      }, () => this.sort());
    }
    else {
      this.setState({
        filters: filters,
        filteredItems: filteredItems,
        card_course: this.state.courseList[0],
      }, () => this.sort());
    }

  }

  //Updates the displayed PreviewCard to the correct [course]
  //if the course's [index] in the list of FilteredResult components is clicked
  previewHandler(course, index) {
    this.setState({
      card_course: course,
      active_card: index
    });
  }

  //Displays the filtered items as FilteredResult components if there are any
  //The original list as FilteredResult components otherwise
  renderResults() {
    const items = this.state.filteredItems.length
      ? this.state.filteredItems
      : this.state.courseList;
    return items.map((result, index) => (
      <FilteredResult key={index} index={index}
        selected={index === this.state.active_card}
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
        <label className="filter-checkbox-label">{name} </label>
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
        <label className="filter-checkbox-label">{name}</label>
      </div>
    ))
  }

  render() {
    return (
      <div className="row loading-margin-top">
        {/* Case where results are still being loaded */}
        {
          this.props.loading === true
          &&
          <div className="loading-results">
            <Loading />;
          </div>
        }
        {/* Case where no results returned */}
        {
          this.state.courseList.length === 0 && this.props.loading === false
          &&
          <div className="col-md-12 col-sm-12 col-xs-12 results">
            <img src="/noClassImage.png" className="img-responsive no-results" alt="No class found"></img>
            <div className="no-results-text">Sorry! No classes match your search.</div>
          </div>
        }
        {/* Case where results are returned (non-empty) */}
        {
          this.state.courseList.length !== 0 && this.props.loading !== true
          &&
          <div>
            <div className="col-md-2 col-sm-2 col-xs-2 filter-container" >
              <p className="filter-title">Filter</p>
              <div className="filter-sub-category">
                <p className="filter-sub-title">Semester</p>
                {this.renderSemesterCheckboxes()}
              </div>
              <div className="filter-sub">
                <p className="filter-sub-title">Level</p>
                {this.renderClassLevelCheckBoxes()}
              </div>
            </div>
            <div className="col-md-3 col-sm-3 col-xs-3 results">

              <div className="row no-left-margin">
                <div>
                  <p className="results-num-classes-found">We found <strong>{this.state.filteredItems.length == 0 ? this.state.courseList.length : this.state.filteredItems.length}</strong> courses</p>
                </div>
              </div>
              <div className="row no-left-margin">
                <div className="results-sort-by-container">
                  <p className="results-sort-by-text">
                  Sort By:
                    </p>
                  <select value={this.state.selected} className="results-sort-by-select" onChange={(e) => this.handleSelect(e)}>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Overall Rating</option>
                    <option value="diff" >Difficulty</option>
                    <option value="work">Workload</option>
                  </select>
                </div>
              </div>

              <div className="results-classes-list">
                <ul>
                  {this.renderResults()}
                </ul>
              </div>
            </div>
            <div className="col-md-7 col-sm-7 col-xs-7 preview">
              <PreviewCard course={this.state.card_course} />
            </div>
          </div>
        }
      </div>
    );
  }
}

ResultsDisplay.propTypes = {
  courses: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired
};

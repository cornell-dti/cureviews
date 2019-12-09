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
      selected: "relevance",
      filters: {
        "Fall": true, "Spring": true,
        "1000": true, "2000": true,
        "3000": true, "4000": true,
        "5000+": true
      }, // key value pair name:checked
      filteredItems: this.props.courses
    };
    this.previewHandler = this.previewHandler.bind(this);
    this.sort = this.sort.bind(this);
    this.initialSort = this.initialSort.bind(this);

  }


  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this.setState({
        courseList: this.props.courses,
        relevantCourseList: this.props.courses,
        card_course: this.props.courses[0],
        active_card: 0,
        selected: "relevance",
        filters: {
          "Fall": true, "Spring": true, "1000": true, "2000": true,
          "3000": true, "4000": true, "5000+": true
        }, // key value pair => name:checked
        filteredItems: this.props.courses
      }, () => this.initialSort())
    }
  }

  handleSelect = (event) => {
    let opt = event.target.value;
    this.setState({ selected: opt }, () => this.sort());
  }

  initialSort() {
    const data = this.props.courses.sort(
      (a, b) => {
        let first = (Number(b.score) || 0);
        let second = (Number(a.score) || 0);

        if (first === second) {
          return (a.classNum - b.classNum);
        }
        else {
          return (first - second);
        }
      });
    this.setState({
      filteredItems: data,
      courseList: data,
      card_course: data[0],
      active_card: 0
    });
  }

  sort() {
    if (this.state.filteredItems.length == 0) {
      if (this.state.selected == "relevance") {
        const data = this.state.courseList.sort(
          (a, b) => {
            let first = (Number(b.score) || 0);
            let second = (Number(a.score) || 0);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
        this.setState({
          courseList: data,
          card_course: data[0],
          active_card: 0
        });
      }
      else if (this.state.selected == "rating") {
        const data = this.state.courseList.sort(
          (a, b) => {
            let first = (Number(b.classRating) || 0);
            let second = (Number(a.classRating) || 0);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
        this.setState({
          courseList: data,
          card_course: data[0],
          active_card: 0
        });
      }
      else if (this.state.selected == "diff") {
        const data = this.state.courseList.sort(
          (a, b) => {
            let first = (Number(a.classDifficulty) || Number.MAX_SAFE_INTEGER);
            let second = (Number(b.classDifficulty) || Number.MAX_SAFE_INTEGER);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
        this.setState({
          courseList: data,
          card_course: data[0],
          active_card: 0
        });

      }
      else if (this.state.selected == "work") {
        const data = this.state.courseList.sort(
          (a, b) => {
            let first = (Number(a.classWorkload) || Number.MAX_SAFE_INTEGER);
            let second = (Number(b.classWorkload) || Number.MAX_SAFE_INTEGER);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
        this.setState({
          courseList: data,
          card_course: data[0],
          active_card: 0
        });
      }
    }
    else {
      if (this.state.selected == "relevance") {
        const data = this.state.filteredItems.sort(
          (a, b) => {
            let first = (Number(b.score) || 0);
            let second = (Number(a.score) || 0);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
        this.setState({
          filteredItems: data,
          card_course: data[0],
          active_card: 0
        });
      }
      else if (this.state.selected == "rating") {
        const data = this.state.filteredItems.sort(
          (a, b) => {
            let first = (Number(b.classRating) || 0);
            let second = (Number(a.classRating) || 0);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
        this.setState({
          filteredItems: data,
          card_course: data[0],
          active_card: 0
        });
      }
      else if (this.state.selected == "diff") {
        const data = this.state.filteredItems.sort(
          (a, b) => {
            let first = (Number(a.classDifficulty) || Number.MAX_SAFE_INTEGER);
            let second = (Number(b.classDifficulty) || Number.MAX_SAFE_INTEGER);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
        this.setState({
          filteredItems: data,
          card_course: data[0],
          active_card: 0
        });

      }
      else if (this.state.selected == "work") {
        const data = this.state.filteredItems.sort(
          (a, b) => {
            let first = (Number(a.classWorkload) || Number.MAX_SAFE_INTEGER);
            let second = (Number(b.classWorkload) || Number.MAX_SAFE_INTEGER);

            if (first === second) {
              return (a.classNum - b.classNum);
            }
            else {
              return (first - second);
            }
          });
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
    return (
      <div className="row margin-top">
        {/* Case where results are still being loaded */}
        {
          this.props.loading === true
          &&
          <div className="results-loading">
            <Loading />;
          </div>
        }
        {/* Case where no results returned */}
        {
          this.state.courseList.length === 0 && this.props.loading === false
          &&
          <div className="col-md-12 col-sm-12 col-xs-12" id="results">
            <img src="/noClassImage.png" className="img-responsive no-results" alt="No class found"></img>
            <div className="no-results-cap">Sorry! No classes match your search.</div>
          </div>
        }
        {/* Case where results are returned (non-empty) */}
        {
          this.state.courseList.length !== 0 && this.props.loading !== true
          &&
          <div>
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
                  <p className="num-classes-found">We found <strong>{this.state.filteredItems.length == 0 ? this.state.courseList.length : this.state.filteredItems.length}</strong> courses</p>
                </div>
                <div className="col-md-7 col-sm-7 col-xs-7 display-inline">
                  <p className="sort-by">
                    Sort By:
                    </p>
                  <select className="browser-default" onChange={(e) => this.handleSelect(e)}>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Overall Rating</option>
                    <option value="diff" >Difficulty</option>
                    <option value="work">Workload</option>
                  </select>
                </div>
              </div>
              <div id="listOfClassResults">
                <ul>
                  {this.renderResults()}
                </ul>
              </div>
            </div>
            <div className="col-md-5 col-sm-5 col-xs-5" id="preview">
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
  loading: PropTypes.bool.isRequired
};


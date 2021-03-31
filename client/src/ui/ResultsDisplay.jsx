import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./css/ResultsDisplay.css"; // css files
import FilteredResult from './FilteredResult.tsx';
import PreviewCard from './PreviewCard.jsx';
import Loading from 'react-loading-animation';
import AsyncSelect from "react-select/async";


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
      },
      filterMap: this.getInitialFilterMap(), // key value pair name:checked
      filteredItems: this.props.courses
    };
    this.previewHandler = this.previewHandler.bind(this);
    this.sortBy = this.sortBy.bind(this);
    this.getSubjectOptions = this.getSubjectOptions.bind(this);
    this.handleMajorFilterChange = this.handleMajorFilterChange.bind(this);
    this.renderCheckboxes = this.renderCheckboxes.bind(this);
    this.filterClasses = this.filterClasses.bind(this);
    this.getInitialFilterMap = this.getInitialFilterMap.bind(this);
    this.sort = this.sort.bind(this);

  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props || prevState.courseList.length !== this.state.courseList.length) {
      this.setState({
        courseList: this.props.courses,
        relevantCourseList: this.props.courses,
        card_course: this.props.courses[0],
      }, () => this.filterClasses());
    }
    if (prevProps.userInput !== this.props.userInput) {
      this.setState({ filterMap: this.getInitialFilterMap() }, () => this.filterClasses())
    }
  }

  getInitialFilterMap() {
    return new Map([
      ["levels", new Map([["1000", true], ["2000", true], ["3000", true], ["4000", true], ["5000+", true]])],
      ["semesters", new Map([["Fall", true], ["Spring", true]])],
      ["subjects", []],
    ]);
  }

  // Handles selecting different sort bys
  handleSelect = (event) => {
    let opt = event.target.value;
    this.setState({ selected: opt }, () => this.sort());
  }

  // Helper function to sort()
  sortBy(courseList, sortByField, fieldDefault, increasing) {
    courseList = courseList.sort(
      (a, b) => {
        let first = (Number(b[sortByField]) || fieldDefault);
        let second = (Number(a[sortByField]) || fieldDefault);

        if (first === second) {
          return (a.classNum - b.classNum);
        }
        else {
          if (increasing) {
            return (first - second);
          }
          else {
            return (second - first);
          }

        }
      });
    this.setState({
      filteredItems: courseList,
      card_course: courseList[0],
      active_card: 0
    });
  }

  // Sorts list of class results by category selected in this.state.selected
  sort() {
    let availableClasses;
    if (this.state.filteredItems.length === 0) {
      availableClasses = this.state.courseList;
    }
    else {
      availableClasses = this.state.filteredItems;
    }

    if (this.state.selected === "relevance") {
      this.sortBy(availableClasses, "score", 0, true);
    }
    else if (this.state.selected === "rating") {
      this.sortBy(availableClasses, "classRating", 0, true);
    }
    else if (this.state.selected === "diff") {
      this.sortBy(availableClasses, "classDifficulty", Number.MAX_SAFE_INTEGER, false);
    }
    else if (this.state.selected === "work") {
      this.sortBy(availableClasses, "classWorkload", Number.MAX_SAFE_INTEGER, false);
    }
  }

  filterClasses() {

    let semesters = Array.from(this.state.filterMap.get("semesters").keys()).filter(semester =>
      this.state.filterMap.get("semesters").get(semester))

    let filteredItems = this.state.courseList.filter(course =>
      semesters.some(semester =>
        course.classSems.some(element => element.includes(semester.slice(0, 2).toUpperCase())))
    );

    let levels = Array.from(this.state.filterMap.get("levels").keys()).filter(level => this.state.filterMap.get("levels").get(level))
    filteredItems = filteredItems.filter(course =>
      levels.some(level =>
        level === "5000+" ? course.classNum.slice(0, 1) >= "5" : course.classNum.slice(0, 1) === level.slice(0, 1))
    );

    let subjects_objects = this.state.filterMap.get("subjects");
    if (subjects_objects && subjects_objects.length > 0) {
      filteredItems = filteredItems.filter(course =>
        subjects_objects.some(subject_object => course.classSub.toUpperCase() === subject_object.value));
    }

    this.setState({ filteredItems: filteredItems }, () => this.sort());

  }

  //Updates the list of filtered items when filters are checked/unchecked
  checkboxOnChange = e => {
    const group = e.target.getAttribute("group");
    const name = e.target.name;
    const checked = e.target.checked;

    let newFilterMap = this.state.filterMap;

    newFilterMap.get(group).set(name, checked);

    this.setState({ filterMap: newFilterMap }, () => this.filterClasses());

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

  renderCheckboxes(group) {
    let group_list = Array.from(this.state.filterMap.get(group).keys());
    return group_list.map((name, index) => (
      <div className="filter-entry-container" key={index}>
        <input
          onChange={(e) => this.checkboxOnChange(e)}
          type="checkbox"
          checked={this.state.filterMap.get(group).get(name)}
          group={group}
          name={name}
        />
        <label className="filter-checkbox-label">{name}</label>
      </div>
    ))
  }


  handleMajorFilterChange(selectedMajors) {

    if (selectedMajors === null) {
      selectedMajors = []
    }

    let newFilterMap = this.state.filterMap;

    newFilterMap.set("subjects", selectedMajors)

    this.setState({ filterMap: newFilterMap }, () => this.filterClasses());
  }

  getSubjectOptions(inputValue, callback) {
    console.log("Deprecated functionality");
    // Meteor.call("getSubjectsByKeyword", inputValue, (err, subjectList) => {
    //   if (!err && subjectList && subjectList.length !== 0) {
    //     // Save the list of Subject objects that matches the request

    //     const subjectOptions = []
    //     for(const subject in subjectList){
    //       subjectOptions.push({
    //         "value" : subjectList[subject].subShort.toUpperCase(),
    //         "label" : subjectList[subject].subShort.toUpperCase()
    //       })
    //     }

    //     callback(subjectOptions)
    //   }
    //   else {
    //     callback([])
    //   }
    // });

    // callback(this.filterColors(inputValue));
  }

  render() {
    return (
      <div className="row loading-margin-top noLeftRightMargin">
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
            <img src="/noResults.svg" className="img-responsive no-results" alt="No class found"></img>
            <div className="no-results-text">Sorry! No classes match your search.</div>
          </div>
        }
        {/* Case where results are returned (non-empty) */}
        {
          this.state.courseList.length !== 0 && this.props.loading !== true
          &&
          <div className="results-column-container">
            <div className="hidden-xs hidden-sm  col-md-2 col-sm-2 col-xs-2 filter-container" >
              <p className="filter-title">Filter</p>
              <div className="filter-sub-category">
                <p className="filter-sub-title">Semester</p>
                {this.renderCheckboxes("semesters")}
              </div>
              <div className="filter-sub-category">
                <p className="filter-sub-title">Level</p>
                {this.renderCheckboxes("levels")}
              </div>
              <div className={"filter-sub-category " + (this.props.type === "major" ? "filter-major-disabled" : "")}>
                <p className="filter-sub-title">Major</p>
                <AsyncSelect
                  className=""
                  isMulti
                  isDisabled={this.props.type === "major"}
                  placeholder={"Search Major"}
                  classNamePrefix={"react-major-select"}
                  isClearable={true}
                  defaultOptions={false}
                  loadOptions={this.getSubjectOptions}
                  onChange={this.handleMajorFilterChange}
                  value={this.state.filterMap.get("subjects")}
                  noOptionsMessage={() => "No Subjects Match"}
                />
              </div>
            </div>
            <div className="col-md-3 col-sm-12 col-xs-12 results">

              <div className="row no-left-margin">
                <div>
                  <p className="results-num-classes-found">We found <strong>{this.state.filteredItems.length === 0 ? this.state.courseList.length : this.state.filteredItems.length}</strong> courses
                  for &quot;{this.props.userInput}&quot;</p></div>
              </div>
              <div className="row no-left-margin mdown-8">
                <div className="results-sort-by-container">
                  <p className="hidden-xs hidden-sm results-sort-by-text">
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
            <div className="hidden-xs hidden-sm col preview">
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
  type: PropTypes.string.isRequired,
  userInput: PropTypes.string.isRequired
};

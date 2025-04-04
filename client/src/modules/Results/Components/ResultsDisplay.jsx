import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FilteredResult from './FilteredResult.tsx';
import PreviewCard from './PreviewCard.jsx';
import FilterPopup from './FilterPopup';
import Loading from '../../Globals/Loading';

import FilterIcon from '../../../assets/icons/filtericon.svg';

import styles from '../Styles/Results.module.css';

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
      cardCourse: this.props.courses[0],
      activeCard: 0,
      selected: 'relevance',
      filters: {
        Fall: true,
        Spring: true,
        1000: true,
        2000: true,
        3000: true,
        4000: true,
        '5000+': true
      },
      filterMap: this.getInitialFilterMap(), // key value pair name:checked
      filteredItems: this.props.courses,
      fullscreen: false,
      transformGauges: false,
      showFilterPopup: false
    };
    this.previewHandler = this.previewHandler.bind(this);
    this.sortBy = this.sortBy.bind(this);
    this.getSubjectOptions = this.getSubjectOptions.bind(this);
    this.renderCheckboxes = this.renderCheckboxes.bind(this);
    this.filterClasses = this.filterClasses.bind(this);
    this.getInitialFilterMap = this.getInitialFilterMap.bind(this);
    this.sort = this.sort.bind(this);
    this.setShowFilterPopup = this.setShowFilterPopup.bind(this);
    this.scrollReviews = this.scrollReviews.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps !== this.props ||
      prevState.courseList.length !== this.state.courseList.length
    ) {
      this.setState(
        {
          courseList: this.props.courses,
          relevantCourseList: this.props.courses,
          cardCourse: this.props.courses[0] || null
        },
        () => this.filterClasses()
      );
    }
    if (prevProps.userInput !== this.props.userInput) {
      this.setState({ filterMap: this.getInitialFilterMap() }, () =>
        this.filterClasses()
      );
    }
  }

  getInitialFilterMap() {
    return new Map([
      [
        'levels',
        new Map([
          ['1000', true],
          ['2000', true],
          ['3000', true],
          ['4000', true],
          ['5000+', true]
        ])
      ],
      [
        'semesters',
        new Map([
          ['Fall', true],
          ['Spring', true],
          ['Summer', true]
        ])
      ],
      ['subjects', []]
    ]);
  }

  /**
   * Handles selecting different sort filters
   */
  handleSelect = (event) => {
    let opt = event.target.value;
    this.setState({ selected: opt }, () => this.sort());
  };

  /**
   * Helper function to sort()
   */
  sortBy(courseList, sortByField, fieldDefault, increasing) {
    courseList = courseList.sort((a, b) => {
      let first = Number(b[sortByField]) || fieldDefault;
      let second = Number(a[sortByField]) || fieldDefault;

      if (first === second) {
        return a.classNum - b.classNum;
      } else {
        if (increasing) {
          return first - second;
        } else {
          return second - first;
        }
      }
    });
    this.setState({
      filteredItems: courseList,
      cardCourse: courseList[0],
      activeCard: 0
    });
  }

  /**
   * Sorts list of class results by category selected in this.state.selected
   */
  sort() {
    const availableClasses = this.state.filteredItems;

    if (this.state.selected === 'relevance') {
      this.sortBy(availableClasses, 'score', 0, true);
    } else if (this.state.selected === 'rating') {
      this.sortBy(availableClasses, 'classRating', 0, true);
    } else if (this.state.selected === 'diff') {
      this.sortBy(
        availableClasses,
        'classDifficulty',
        Number.MAX_SAFE_INTEGER,
        false
      );
    } else if (this.state.selected === 'work') {
      this.sortBy(
        availableClasses,
        'classWorkload',
        Number.MAX_SAFE_INTEGER,
        false
      );
    }
  }

  filterClasses() {
    let semesters = Array.from(
      this.state.filterMap.get('semesters').keys()
    ).filter((semester) => this.state.filterMap.get('semesters').get(semester));

    let filteredItems = this.state.courseList.filter((course) =>
      semesters.some((semester) =>
        course.classSems.some((element) =>
          element.includes(semester.slice(0, 2).toUpperCase())
        )
      )
    );

    let levels = Array.from(this.state.filterMap.get('levels').keys()).filter(
      (level) => this.state.filterMap.get('levels').get(level)
    );
    filteredItems = filteredItems.filter((course) =>
      levels.some((level) =>
        level === '5000+'
          ? course.classNum.slice(0, 1) >= '5'
          : course.classNum.slice(0, 1) === level.slice(0, 1)
      )
    );

    let subjectsObjects = this.state.filterMap.get('subjects');
    if (subjectsObjects && subjectsObjects.length > 0) {
      filteredItems = filteredItems.filter((course) =>
        subjectsObjects.some(
          (subjectObject) =>
            course.classSub.toUpperCase() === subjectObject.value
        )
      );
    }

    this.setState(
      {
        filteredItems: filteredItems,
        cardCourse: filteredItems[0] || null
      },
      () => this.sort()
    );
  }

  /**
   * Updates the list of filtered items when filters are checked/unchecked
   */
  checkboxOnChange = (e) => {
    const group = e.target.getAttribute('group');
    const name = e.target.name;
    const checked = e.target.checked;

    let newFilterMap = this.state.filterMap;

    newFilterMap.get(group).set(name, checked);

    this.setState({ filterMap: newFilterMap }, () => this.filterClasses());
  };

  /**
   * Updates the displayed PreviewCard to the correct [course]
   * if the course's [index] in the list of FilteredResult components is clicked
   */
  previewHandler(course, index) {
    this.setState({
      cardCourse: course,
      activeCard: index
    });
    this.setState({ transformGauges: false });
  }

  computeHeight() {
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    );
  }

  /**
   * Displays the filtered items as FilteredResult components if there are any
   * The original list as FilteredResult components otherwise
   */
  renderResults() {
    const items = this.state.filteredItems;

    return items.map((result, index) => (
      <div
        className={styles.filteredresults}
        data-cy={`results-display-${result.classSub.toLowerCase()}-${
          result.classNum
        }`}
      >
        <FilteredResult
          key={index}
          index={index}
          selected={index === this.state.activeCard}
          course={result}
          previewHandler={this.previewHandler}
          sortBy={this.state.selected}
        />
      </div>
    ));
  }

  renderCheckboxes(group) {
    let groupList = Array.from(this.state.filterMap.get(group).keys());
    return groupList.map((name, index) => (
      <div className={styles.filterlabel}>
        <label className={styles.filterlabel}>
          <input
            className={styles.filterlabel}
            onChange={(e) => this.checkboxOnChange(e)}
            type="checkbox"
            checked={this.state.filterMap.get(group).get(name)}
            group={group}
            name={name}
          />
          {name}
        </label>
      </div>
    ));
  }

  getSubjectOptions(inputValue, callback) {
    console.log();
  }

  setShowFilterPopup() {
    this.setState({ showFilterPopup: !this.state.showFilterPopup });
  }

  scrollReviews(e) {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > 80) {
      this.setState({ transformGauges: true });
    } else {
      this.setState({ transformGauges: false });
    }
  }

  toggleFullscreen() {
    this.setState({ fullscreen: false });
  }

  render() {
    return (
      <div className={styles.container}>
        <h1> Search Results </h1>
        {this.props.loading ? (
          <Loading />
        ) : (
          <div className={styles.layout} data-cy="results-display">
            <>
              <div className={styles.filtercol}>
                <div className={styles.filtertext}>Filter</div>
                <div>
                  <div className={styles.filtercategory}>Semester</div>
                  {this.renderCheckboxes('semesters')}
                </div>
                <div>
                  <div className={styles.filtercategory}>Level</div>
                  {this.renderCheckboxes('levels')}
                </div>
              </div>

              <div className={styles.columns}>
                <div>
                  We found <b>{this.state.filteredItems.length}</b> courses for
                  &quot;
                  {this.props.userInput}&quot;
                </div>

                <div className={styles.bar}>
                  <div>
                    <label>Sort By: </label>
                    <select
                      value={this.state.selected}
                      className={styles.sortselector}
                      onChange={(e) => this.handleSelect(e)}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="rating">Overall Rating</option>
                      <option value="diff">Difficulty</option>
                      <option value="work">Workload</option>
                    </select>
                  </div>

                  <button
                    className={styles.filterbutton}
                    onClick={this.setShowFilterPopup}
                  >
                    Filter <img src={FilterIcon} alt="filter-icon" />
                  </button>
                </div>
                {this.state.showFilterPopup && (
                  <FilterPopup
                    state={this.state}
                    props={this.props}
                    renderCheckboxes={this.renderCheckboxes}
                    getSubjectOptions={this.getSubjectOptions}
                    setShowFilterPopup={this.setShowFilterPopup}
                  />
                )}

                {this.state.filteredItems.length !== 0 && (
                  <div className={styles.layout}>
                    <div className={styles.list}>
                      <div className={styles.resultslist}>
                        <ul>{this.renderResults()}</ul>
                      </div>
                    </div>
                    <div className={styles.preview}>
                      <PreviewCard
                        course={this.state.cardCourse}
                        transformGauges={this.state.transformGauges}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          </div>
        )}
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

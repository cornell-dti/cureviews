import React, { useEffect, useState } from 'react';

import FilteredResult from './FilteredResult';
import PreviewCard from './PreviewCard';
import FilterPopup from './FilterPopup';
import Loading from '../../Globals/Loading';

import FilterIcon from '../../../assets/icons/filtericon.svg';

import styles from '../Styles/Results.module.css';
import { Class } from 'common';
import Bear from '/surprised_bear.svg';

/*
  ResultsDisplay Component.a

  Used by Results component, renders filters,
  list of class objects (results), and PreviewCard.

  Props:  courses - is a list of class objects
          loading - bool, true if back-end has no returned from search yet

*/

export const ResultsDisplay = ({
  courses,
  loading,
  type,
  userInput
}: ResultsDisplayProps) => {
  const [courseList, setCourseList] = useState(courses);
  const [filteredItems, setFilteredItems] = useState(courses);
  const [cardCourse, setCardCourse] = useState(courses[0]);
  const [activeCard, setActiveCard] = useState<number>(0);

  type SortBy = 'relevance' | 'rating' | 'diff' | 'work';
  const [selected, setSelected] = useState<SortBy>(
    type === 'major' ? 'rating' : 'relevance'
  );

  const [transformGauges, setTransformGauges] = useState<boolean>(false);
  const [showFilterPopup, setShowFilterPopup] = useState<boolean>(false);
  const [searchListViewEnabled, setSearchListViewEnabled] = useState<boolean>(true);

  type FilterValue = Map<string, boolean> | string[];
  type FilterMap = Map<string, FilterValue>;
  const getInitialFilterMap = (): FilterMap =>
    new Map<string, FilterValue>([
      [
        'levels',
        new Map<string, boolean>([
          ['1000', true],
          ['2000', true],
          ['3000', true],
          ['4000', true],
          ['5000+', true]
        ])
      ],
      [
        'semesters',
        new Map<string, boolean>([
          ['Fall', true],
          ['Spring', true]
        ])
      ],
      [
        'subjects', []
      ]
    ]);
  const [filterMap, setFilterMap] = useState<FilterMap>(getInitialFilterMap());

  useEffect(() => {
    setCourseList(courses);
    setCardCourse(courses[0] || {});
    setFilteredItems(courses);
    setFilterMap(getInitialFilterMap());
  }, [courses, userInput]);

  useEffect(() => {
    filterClasses();
  }, [filterMap]);

  useEffect(() => {
    sort(filteredItems);
  }, [selected]);

  /**
   * Handles selecting different sort filters
   */
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let opt = event.target.value as SortBy;
    setSelected(opt);
  };

  /**
   * Helper function to sort()
   */
  const sortBy = (
    courseList: Array<any>,
    sortByField: string,
    fieldDefault: number,
    increasing: boolean
  ) => {
    if (courseList.length === 0) return;
    const sorted = [...courseList].sort((a, b) => {
      const first = Number(b[sortByField]) || fieldDefault;
      const second = Number(a[sortByField]) || fieldDefault;

      if (first === second) {
        return a.classNum - b.classNum;
      } else {
        return increasing ? first - second : second - first;
      }
    });

    setFilteredItems(sorted);
    setCardCourse(sorted[0]);
    setActiveCard(0);
  };

  /**
   * Sorts list of class results by category selected in state
   */
  const sort = (items: Array<any>) => {
    switch (selected) {
      case 'relevance':
        sortBy(items, 'score', 0, true);
        break;
      case 'rating':
        sortBy(items, 'classRating', 0, true);
        break;
      case 'diff':
        sortBy(items, 'classDifficulty', Number.MAX_SAFE_INTEGER, false);
        break;
      case 'work':
        sortBy(items, 'classDifficulty', 0, true);
        break;
    }
  };

  const filterClasses = () => {
    const semesters = Array.from(
      (filterMap.get('semesters') as Map<string, boolean>).entries()
    )
      .filter(([_, value]) => value)
      .map(([key]) => key);

    let filtered = courseList.filter((course) =>
      semesters.some((semester) =>
        course.classSems?.some((element: string) =>
          element.includes(semester.slice(0, 2).toUpperCase())
        )
      )
    );

    const levels = Array.from(
      (filterMap.get('levels') as Map<string, boolean>).entries()
    )
      .filter(([_, value]) => value)
      .map(([key]) => key);

    filtered = filtered.filter((course) =>
      levels.some((level) =>
        level === '5000+'
          ? course.classNum[0] >= '5'
          : course.classNum[0] === level[0]
      )
    );

    const subjects = filterMap.get('subjects') as string[];
    if (subjects && subjects.length > 0) {
      filtered = filtered.filter((course) =>
        subjects.some(
          (subject) => course.classSub.toUpperCase() === subject.toUpperCase()
        )
      );
    }

    setFilteredItems(filtered);
    sort(filtered);
  };

  /**
   * Updates the list of filtered items when filters are checked/unchecked
   */
  const checkboxOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const group = e.currentTarget.dataset.group!;
    const name = e.currentTarget.name;
    const checked = e.currentTarget.checked;

    setFilterMap((prev) => {
      const updatedMap = new Map(prev);
      const groupValue = updatedMap.get(group);

      if (groupValue instanceof Map) {
        groupValue.set(name, checked); // Update boolean map
        updatedMap.set(group, groupValue);
      }
      return updatedMap;
    });
    filterClasses();
  };

  /**
   * Updates the displayed PreviewCard to the correct [course]
   * if the course's [index] in the list of FilteredResult components is clicked
   */
  const previewHandler = (course: any, index: number) => {
    setCardCourse(course);
    setActiveCard(index);
    setTransformGauges(false);
  };

  /**
   * Displays the filtered items as FilteredResult components if there are any
   * The original list as FilteredResult components otherwise
   */
  const renderResults = () => {
    if (filteredItems.length === 0) {
      return <></>
    } else {
      return filteredItems.map((result, index) => (
        <div
          className={styles.filteredresults}
          data-cy={`results-display-${result.classSub.toLowerCase()}-${
            result.classNum
          }`}
        >
          <FilteredResult
            key={index}
            index={index}
            selected={index === activeCard}
            course={result}
            previewHandler={previewHandler}
            sortBy={selected}
          />
        </div>
      ));
    }
  };

  const renderCheckboxes = (group: string) => {
    let groupList = Array.from(
      (filterMap.get(group) as Map<string, boolean>).keys()
    );
    return groupList.map((name) => (
      <div className={styles.filterlabel}>
        <label className={styles.filterlabel}>
          <input
            className={styles.filterlabel}
            onChange={(e) => checkboxOnChange(e)}
            type="checkbox"
            checked={(filterMap.get(group) as Map<string, boolean>).get(name)}
            data-group={group}
            name={name}
          />
          {name}
        </label>
      </div>
    ));
  };

  return (
    <>
      {loading && <Loading />}
      <div className={styles.container}>
        {/* Case where results are returned, even if zero */}
        {!loading && (
          <div className={styles.layout} data-cy="results-display">
            {/* Case where no results returned */}
            <div className={styles.leftbar}>
              {courseList.length !== 0 && <h1 className={styles.header}> Search Results </h1>}
              {/*<button*/}
              {/*  className={styles.filterbutton}*/}
              {/*  onClick={() => setSearchListViewEnabled(!searchListViewEnabled)}*/}
              {/*>*/}
              {/*  {searchListViewEnabled ? 'Hide' : 'View'} Search Results*/}
              {/*</button>*/}
              <div className={styles.filtersearch}>
                {courseList.length !== 0 && (
                  <div className={styles.filtercol}>
                    <div className={styles.filtertext}>Filter</div>
                    <div>
                      <div className={styles.filtercategory}>Semester</div>
                      {renderCheckboxes('semesters')}
                    </div>
                    <div>
                      <div className={styles.filtercategory}>Level</div>
                      {renderCheckboxes('levels')}
                    </div>
                  </div>
                )}

                {filteredItems.length !== 0 && (
                  <div className={styles.columns}>
                    {searchListViewEnabled && (
                      <>
                        <div>
                          We found <b>{filteredItems.length}</b> courses for
                          &quot;
                          {userInput}
                          &quot;
                        </div>
                        <div className={styles.filtersortbuttons}>
                          <div className={styles.bar}>
                            <div>
                              <label>Sort By: </label>
                              <select
                                value={selected}
                                className={styles.sortselector}
                                onChange={(e) => handleSelect(e)}
                              >
                                <option value="relevance">Relevance</option>
                                <option value="rating">Overall Rating</option>
                                <option value="diff">Difficulty</option>
                                <option value="work">Workload</option>
                              </select>
                            </div>

                            <button
                              className={styles.filterbutton}
                              onClick={() => setShowFilterPopup(!showFilterPopup)}
                            >
                              Filter <img src={FilterIcon} alt="filter-icon" />
                            </button>
                          </div>
                          {showFilterPopup && (
                            <FilterPopup
                              renderCheckboxes={renderCheckboxes}
                              setShowFilterPopup={() =>
                                setShowFilterPopup(!showFilterPopup)
                              }
                            />
                          )}
                        </div>
                        <div className={styles.layout}>
                          <div className={styles.list}>
                            <div className={styles.resultslist}>
                              <ul>{renderResults()}</ul>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {filteredItems.length === 0 && courseList.length !== 0 && (
                  <div className={styles.columns}>
                    {searchListViewEnabled && (
                      <>
                        <div className={styles.filtersortbuttons}>
                          <div className={styles.bar}>
                            <button
                              className={styles.filterbutton}
                              onClick={() => setShowFilterPopup(!showFilterPopup)}
                            >
                              Filter <img src={FilterIcon} alt="filter-icon" />
                            </button>
                          </div>
                          {showFilterPopup && (
                            <FilterPopup
                              renderCheckboxes={renderCheckboxes}
                              setShowFilterPopup={() =>
                                setShowFilterPopup(!showFilterPopup)
                              }
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {filteredItems.length === 0 && (
              <div className={styles.noitems}>
                <img src={Bear} alt="Bear Icon" className={styles.bearicon} />
                <div>
                  No classes found. Try searching something else
                  {courseList.length !== 0 ? " or switching up the filters!" : "!"}
                </div>
              </div>
            )}

            {filteredItems.length !== 0 && (
              <div className={styles.preview}>
                <div className={styles.previewcard}>
                  <PreviewCard
                    course={cardCourse}
                    // transformGauges={transformGauges}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

interface ResultsDisplayProps {
  courses: Array<Class>;
  loading: boolean;
  type: string;
  userInput: string;
}

export default ResultsDisplay;
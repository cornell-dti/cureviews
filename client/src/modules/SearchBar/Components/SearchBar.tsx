import React, { useState, useEffect } from 'react';

import { Redirect } from 'react-router';
import axios from 'axios';
import { Session } from '../../../session-store';

import Course from './Course';
import SubjectResult from './SubjectResult';
import ProfessorResult from './ProfessorResult';
import { Class, Subject, Professor } from 'common';

import styles from '../Styles/SearchBar.module.css';
import SearchIcon from '../../../assets/icons/search.svg';

type SearchBarProps = {
  isInNavbar: boolean;
  contrastingResultsBackground?: boolean;
  userInput?: string;
};

export const SearchBar = ({
  isInNavbar,
  contrastingResultsBackground,
  userInput
}: SearchBarProps) => {
  const [index, setIndex] = useState<number>(0);
  const [enter, setEnter] = useState<0 | 1>(0);
  const [mouse, setMouse] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<boolean>(false);
  const [courses, setCourses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [query, setQuery] = useState<string>('');
  const [width, setWidth] = useState<number>(window.innerWidth);

  let timeoutId: NodeJS.Timeout;

  useEffect(() => {
    function debounce(func: Function, delay: number) {
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    }

    async function fetchCourses() {
      const response = await axios.post(`/api/search/results`, {
        query: query
      });
      const courseList = response.data.result.courses;
      const subjectList = response.data.result.subjects;
      const professorList = response.data.result.professors;
      setCourses(courseList);
      setSubjects(subjectList);
      setProfessors(professorList);
    }
    const debouncedFetchCourses = debounce(fetchCourses, 300);

    if (query.trim() !== '') {
      debouncedFetchCourses();
    } else {
      setCourses([]);
      setSubjects([]);
      setProfessors([]);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    const resize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const setNewSearchState = () => {
    setSelected(false);
    setMouse(0);
    setEnter(0);
    setIndex(0);
  };

  const handleKeyPress = (e: any) => {
    //detect some arrow key movement (up, down, or enter)
    if (e.key === 'ArrowDown') {
      //if the down arrow was detected, increase the index value by 1 to highlight the next element
      //never index above the total number of results
      const numResults = subjects.length + professors.length + courses.length;
      setIndex(Math.min(index + 1, numResults));
    } else if (e.key === 'ArrowUp') {
      //if the up arrow key was detected, decrease the index value by 1 to highlight the prev element
      //never index below 0 (the first element)
      setIndex(Math.max(index - 1, 0));
    } else if (e.key === 'Enter') {
      //if the enter key was detected, change the state of enter to 1 (true)
      setEnter(1);
    } else {
      updateQuery(e);
    }
  };

  const checkForCourseMatch = (searchQuery: string) => {
    let isMatch = false;
    let querySplit = searchQuery.toLowerCase().split(' ');
    let queryNum = '';
    let querySub = '';
    if (querySplit.length === 2) {
      querySub = querySplit[0];
      queryNum = querySplit[1];
    }
    courses.forEach((course) => {
      let classNum = course.classNum.toLowerCase();
      let classSub = course.classSub.toLowerCase();
      if (classNum === queryNum && classSub === querySub) {
        isMatch = true;
      }
    });

    return isMatch;
  };

  // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  const updateQuery = (event: any) => {
    // Reset index, enter, mouse, and selected
    setNewSearchState();
    // trim the input to remove trailing spaces
    let newUserInput = event.target.value.trim();

    // This is used to make "cs2110" and "cs 2110" equivalent
    if (newUserInput && newUserInput.split(' ').length === 1) {
      newUserInput = newUserInput.replace(
        /(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])/gi,
        ' '
      );
    }

    // only sets the index after key pressed
    if (checkForCourseMatch(newUserInput)) {
      // If input is exact match to a class,
      //  highlight this class by setting index to index of this class
      //  in search results dropdown
      setIndex(subjects.length + 1);
    }
    setQuery(newUserInput);

    Session.setPersistent({ 'last-search': newUserInput });
  };

  /** Render the search results from querying  */
  const renderResults = () => {
    /** Only render if the query is not empty */
    if (query !== '' && !selected) {
      /* User press [ENTER] button?
            => Redirect user to '/results/keyword/query+query'
       */
      if (index === 0 && enter === 1) {
        return (
          <Redirect
            push
            to={`/results/keyword/${query.split(' ').join('+')}`}
          ></Redirect>
        );
      }

      /* Render the first row of the results "Search: [user query]" */
      const ExactSearch = () => {
        return (
          <div>
            <a
              key={'search'}
              className={
                index === 0 && mouse !== 1
                  ? 'active-class resultbutton'
                  : 'resultbutton top-resultbutton'
              }
              href={`/results/keyword/${query.split(' ').join('+')}`}
            >
              <p className={`${styles.searchedtext}`}>
                {'Search: "' + query + '"'}
              </p>
            </a>
          </div>
        );
      };

      /* Subject Lists ... hmmm ? not sure rn
          TODO - document this  
          FIX -> on notion doc 2024 spring dev docs
      */

      // Generate list of matching subjects
      const SubjectsList = () => {
        return (
          <div>
            {subjects.slice(0, 3).map((subject, i) => (
              // create a new class "button" that will set the selected class to this class when it is clicked.
              <SubjectResult
                key={subject._id}
                subject={subject}
                query={query}
                active={index === i + 1 /* plus 1 because of exact search */}
                enter={enter}
                mouse={mouse}
              />
              // the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
              // the index matching with the course
              // the prop "enter" will pass through the value of the enter state
              // the prop "mouse" will pass through the value of the mouse state
            ))}
          </div>
        );
      };

      // Generate list of matching professors
      const ProfessorsList = () => {
        return (
          <div>
            {professors.slice(0, 3).map((professor, i) => (
              // create a new class "button" that will set the selected class to this class when it is clicked.
              <ProfessorResult
                key={professor._id}
                professor={professor}
                query={query}
                active={
                  index ===
                  i + subjects.length + 1 /* plus 1 because of exact search */
                }
                enter={enter}
                mouse={mouse}
              />
            ))}
          </div>
        );
      };

      const CourseList = () => {
        return (
          <div>
            {courses.slice(0, 5).map((course, i) => (
              // create a new class "button" that will set the selected class to this class when it is clicked.
              <Course
                key={course._id}
                course={course}
                query={query}
                active={
                  index === i + subjects.length + professors.length + 1
                  /* plus because of exact search, professors, subjects */
                }
                enter={enter}
                mouse={mouse}
              />
            ))}
          </div>
        );
      };

      return (
        <div>
          <ExactSearch />
          <SubjectsList />
          <ProfessorsList />
          <CourseList />
        </div>
      );
    } else {
      return null;
    }
  };

  const placeholdertext = () => {
    if (isInNavbar) {
      return 'Search for a new course';
    } else if (width >= 840) {
      return 'Look up any course or professor e.g. "FWS", "ECON", or "CS 2110"';
    } else {
      return 'Search any keyword';
    }
  };

  return (
    <div>
      <div
        className={`${styles.searchbar} ${
          isInNavbar ? styles.navbarsearchbar : ''
        } ${query !== '' && styles.searching}`}
      >
        <div className={styles.searchbarcontent}>
          <img
            className={styles.searchicon}
            src={SearchIcon}
            alt="search-icon"
          />
          <input
            className={`${styles.searchtext} `}
            onKeyUp={handleKeyPress}
            defaultValue={isInNavbar ? (userInput ? userInput : '') : ''}
            placeholder={placeholdertext()}
            autoComplete="off"
          />
        </div>

        <ul
          className={styles.output}
          style={query !== '' ? {} : { display: 'none' }}
          onKeyPress={handleKeyPress}
          onMouseEnter={() => setMouse(1)}
          onMouseLeave={() => setMouse(0)}
        >
          {renderResults()}
        </ul>
      </div>
    </div>
  );
};

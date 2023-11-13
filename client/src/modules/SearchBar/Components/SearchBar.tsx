import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import ProfileDropdown from '../../Globals/ProfileDropdown'

import { Redirect } from 'react-router'
import axios from 'axios'
import { Session } from '../../../session-store'

import '../Styles/SearchBar.css'
import Course from './Course'
import SubjectResult from './SubjectResult'
import ProfessorResult from './ProfessorResult'
import { Class, Subject, Professor } from 'common'

type SearchBarProps = {
  isInNavbar: boolean
  contrastingResultsBackground?: boolean
  userInput?: string
  imgSrc: string
  signOut: Function
  isLoggedIn: boolean
}

export const SearchBar = ({
  isInNavbar,
  contrastingResultsBackground,
  userInput,
  imgSrc,
  signOut,
  isLoggedIn
}: SearchBarProps) => {
  const [dropdown, setDropdown] = useState<boolean>(true)
  const [index, setIndex] = useState<number>(0)
  const [enter, setEnter] = useState<0 | 1>(0)
  const [mouse, setMouse] = useState<0 | 1>(0)
  const [selected, setSelected] = useState<boolean>(false)
  const [courses, setCourses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [query, setQuery] = useState<string>('')
  const DEBOUNCE_TIME = 200

  useEffect(() => {
    if (
      query.toLowerCase() !== ''
    ) {
      setTimeout(() => {
        axios
          .post(
            `/v2/getClassesByQuery`,
            { query: query },
          )
          .then((response) => {
            const queryCourseList = response.data.result
            if (queryCourseList.length !== 0) {
              setCourses(queryCourseList.sort(sortCourses))

            } else {
              setCourses([])
            }
          })
          .catch((e) => console.log('Getting courses failed!'))

        axios
          .post(
            `/v2/getSubjectsByQuery`,
            { query: query },
          )
          .then((response) => {
            const subjectList = response.data.result
            if (subjectList && subjectList.length !== 0) {
              // Save the list of Subject objects that matches the request
              setSubjects(subjectList)
            } else {
              setSubjects([])
            }
          })
          .catch((e) => console.log('Getting subjects failed!'))

        axios
          .post(
            `/v2/getProfessorsByQuery`,
            { query: query },
          )
          .then((response) => {
            const professorList = response.data.result
            if (professorList && professorList.length !== 0) {
              // Save the list of Subject objects that matches the request
              setProfessors(professorList)
            } else {
              setProfessors([])
            }
          })
          .catch((e) => console.log('Getting professors failed!'))
      }, DEBOUNCE_TIME)
    }
  }, [query])

  /**
   * Compares classes based on score, then class number, then alphabetically by
   * subject.
   * @param {Class} a
   * @param {Class} b
   * @returns -1, 0, or 1
   */
  const sortCourses = (a: Class, b: Class) => {
    const sortByAlphabet = (a: Class, b: Class) => {
      const aSub = a.classSub.toLowerCase()
      const bSub = b.classSub.toLowerCase()
      if (aSub < bSub) {
        return -1
      } else if (aSub > bSub) {
        return 1
      } else {
        return 0
      }
    }

    return sortByAlphabet(a, b) //|| b.score - a.score || a.classNum - b.classNum ||
  }

  const text =
    window.innerWidth >= 840
      ? 'Search by any keyword e.g. “FWS”, “ECON” or “CS 2110”'
      : 'Search any keyword'

  const setNewSearchState = () => {
    setSelected(false)
    setMouse(0)
    setEnter(0)
    setIndex(0)
  }

  const handleKeyPress = (e: any) => {
    //detect some arrow key movement (up, down, or enter)
    if (e.key === 'ArrowDown') {
      //if the down arrow was detected, increase the index value by 1 to highlight the next element
      setIndex(index + 1)
    } else if (e.key === 'ArrowUp') {
      //if the up arrow key was detected, decrease the index value by 1 to highlight the prev element
      //never index below 0 (the first element)
      setIndex(Math.max(index - 1, 0))
    } else if (e.key === 'Enter') {
      //if the enter key was detected, change the state of enter to 1 (true)
      setEnter(1)
    } else {
      updateQuery(e)
    }
  }

  const checkForCourseMatch = (query: string) => {
    let isMatch = false
    let querySplit = query.toLowerCase().split(' ')
    let queryNum = ''
    let querySub = ''
    if (querySplit.length === 2) {
      querySub = querySplit[0]
      queryNum = querySplit[1]
    }
    courses.forEach((course) => {
      let classNum = course.classNum.toLowerCase()
      let classSub = course.classSub.toLowerCase()
      if (classNum === queryNum && classSub === querySub) {
        isMatch = true
      }
    })

    return isMatch
  }

  // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  const updateQuery = (event: any) => {
    // Reset index, enter, mouse, and selected
    setNewSearchState()
    // trim the query to remove trailing spaces
    let query = event.target.value.trim()

    // This is used to make "cs2110" and "cs 2110" equivalent
    if (query && query.split(' ').length === 1) {
      query = query.match(/[a-z]+|[^a-z]+/gi).join(' ')
    }

    if (checkForCourseMatch(query)) {
      // If query is exact match to a class,
      //  highlight this class by setting index to index of this class
      //  in search results dropdown
      setIndex(subjects.length + 1)
    }
    setQuery(query)

    Session.setPersistent({ 'last-search': query })
  }

  const setInitState = () => {
    setDropdown(true)
    setIndex(0)
    setEnter(0)
    setMouse(0)
    setSelected(false)
    setQuery('')
    setCourses([])
    setSubjects([])
    setProfessors([])
  }

  const renderResults = () => {
    if (query !== '' && !selected) {
      let results = []

      // Used for "enter" key on 'Search: "query" ' button for exact search
      // Sends user to /results/keyword/query+query
      if (index === 0 && enter === 1) {
        setInitState()

        return (
          <Redirect
            push
            to={`/results/keyword/${query.split(' ').join('+')}`}
          ></Redirect>
        )
      }

      let exact_search = (
        <a
          key={'search'}
          className={
            index === 0 && mouse !== 1
              ? 'active-class resultbutton top-resultbutton'
              : 'resultbutton top-resultbutton'
          }
          href={`/results/keyword/${query.split(' ').join('+')}`}
        >
          <p className="result-text">{'Search: "' + query + '"'}</p>
        </a>
      )

      results.push(exact_search)

      let subjectList = subjects.slice(0, 3).map((subject, i) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <SubjectResult
          key={subject._id}
          info={subject}
          query={query}
          active={index === i + 1 /* plus 1 because of exact search */}
          enter={enter}
          mouse={mouse}
        />
        //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
        //the index matching with the course
        //the prop "enter" will pass through the value of the enter state
        //the prop "mouse" will pass through the value of the mouse state
      ))

      // Resets searchbar if user hit "enter" on a major in dropdown
      if (enter === 1) {
        setInitState()
      }

      results.push(subjectList)

      // Generate list of matching professors and add to results list
      let professorList = professors.slice(0, 3).map((professor, i) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <ProfessorResult
          key={professor._id}
          professor={professor}
          query={query}
          active={
            index ===
            i + subjectList.length + 1 /* plus 1 because of exact search */
          }
          enter={enter}
          mouse={mouse}
        />
        //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
        //the index matching with the course
        //the prop "enter" will pass through the value of the enter state
        //the prop "mouse" will pass through the value of the mouse state
      ))

      results.push(professorList)

      results.push(
        courses.slice(0, 5).map((course, i) => (
          //create a new class "button" that will set the selected class to this class when it is clicked.
          <Course
            key={course._id}
            info={course}
            query={query}
            active={
              index ===
              i +
                subjectList.length +
                professorList.length +
                1 /* plus because of exact search, professors, subjects */
            }
            enter={enter}
            mouse={mouse}
          />
          //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
          //the index matching with the course
          //the prop "enter" will pass through the value of the enter state
          //the prop "mouse" will pass through the value of the mouse state
        ))
      )

      return results
    } else {
      return <div />
    }
  }

  return (
    <div
      className={
        'row ' +
        (contrastingResultsBackground ? 'contrasting-result-background' : '')
      }
    >
      <div
        className={
          'col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 searchbar ' +
          (isInNavbar ? 'searchbar-in-navbar' : '')
        }
      >
        <input
          className="search-text"
          onKeyUp={handleKeyPress}
          defaultValue={isInNavbar ? (userInput ? userInput : '') : ''}
          placeholder={isInNavbar ? '' : text}
          autoComplete="off"
        />
        {isInNavbar && isLoggedIn ? (
          <ProfileDropdown imgSrc={imgSrc} signOut={signOut} />
        ) : (
          ''
        )}

        <ul
          className="output"
          style={query !== '' ? {} : { display: 'none' }}
          onKeyPress={handleKeyPress}
          onMouseEnter={() => setMouse(1)}
          onMouseLeave={() => setMouse(0)}
        >
          {renderResults()}
        </ul>
      </div>
    </div>
  )
}

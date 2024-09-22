import React from 'react'
import '../Styles/Course.css'
import { Redirect } from 'react-router'
import { Subject } from 'common'

/*
  Subject Component.

  Simple styling component that represents a single subject (an a element).
  Used to list subject in the results of a search in SearchBar.
*/

type Props = {
  subject: Subject
  query?: string //optional
  active: boolean
  enter: 1 | 0
  mouse: 1 | 0
}

const SubjectResult = ({subject, query, active, enter, mouse}: Props) => {
  // generate full human-readable name of class
  const text = subject.subFull

  //if the element is highlighted and the enter key was pressed, create a Redirect component to go to the class
  if (active && enter === 1) {
    return (
      <Redirect
        push
        to={`/results/major/${subject.subShort.toUpperCase()}`}
      ></Redirect>
    )
  }

  //return classname as a list element
  return (
    //highlight the element if the indexes matched up (the active prop is true)
    //if the mouse is in the list element, highlighting by arrow key stops and follow the mouse hovers
    //if the mouse leaves the list element, highlighting by arrow key continues but from the first element
    <a
      data-cy={`search-result-${subject.subShort.toLowerCase()}`}
      className={
        active && mouse !== 1
          ? 'active-class resultbutton'
          : 'resultbutton'
      }
      href={`/results/major/${subject.subShort.toUpperCase()}`}
    >
      <p className="result-label-subject">Major</p>
      <p className="result-text">{text}</p>
    </a>
  )
}

export default SubjectResult
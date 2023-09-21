import React, { Component } from 'react'
import '../Styles/Course.css'
import { Redirect } from 'react-router'
import { Subject } from 'common'

/*
  Subject Component.

  Simple styling component that represents a single subject (an a element).
  Used to list subject in the results of a search in SearchBar.
*/

type Props = {
  info: Subject
  query?: string //optional
  active: boolean
  enter: 1 | 0
  mouse: 1 | 0
  key: string
}

export default class SubjectResult extends Component<Props> {
  render() {
    // generate full human-readable name of class
    const subjectInfo = this.props.info
    let text = subjectInfo.subFull
    //if the element is highlighted and the enter key was pressed, create a Redirect component to go to the class
    if (this.props.active && this.props.enter === 1) {
      return (
        <Redirect
          push
          to={`/results/major/${subjectInfo.subShort.toUpperCase()}`}
        ></Redirect>
      )
    }

    //return classname as a list element
    return (
      //highlight the element if the indexes matched up (the active prop is true)
      //if the mouse is in the list element, highlighting by arrow key stops and follow the mouse hovers
      //if the mouse leaves the list element, highlighting by arrow key continues but from the first element
      <a
        className={
          this.props.active && this.props.mouse !== 1
            ? 'active-class resultbutton'
            : 'resultbutton'
        }
        href={`/results/major/${subjectInfo.subShort.toUpperCase()}`}
      >
        <p className="result-label-subject">Major</p>
        <p className="result-text">{text}</p>
      </a>
    )
  }
}

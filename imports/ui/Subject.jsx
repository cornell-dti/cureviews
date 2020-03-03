import React, { Component} from 'react';
import PropTypes from 'prop-types';
import "./css/Course.css";
import { Redirect } from 'react-router';

/*
  Subject Component.

  Simple styling component that represents a single subject (an a element).
  Used to list subject in the results of a search in SearchBar.
*/

export default class Course extends Component {

  constructor(props){
    super(props);

  }

  render() {
    // generate full human-readable name of class
    const subjectInfo = this.props.info;
    let text = subjectInfo.subFull;
    //if the element is highlighted and the enter key was pressed, create a Redirect component to go to the class
    if(this.props.active && this.props.enter == 1){
       return <Redirect push to={`/results/major/${subjectInfo.subShort.toUpperCase()}`}></Redirect>
      }

    //return classname as a list element
    return (
    //highlight the element if the indexes matched up (the active prop is true)
    //if the mouse is in the list element, highlighting by arrow key stops and follow the mouse hovers
    //if the mouse leaves the list element, highlighting by arrow key continues but from the first element
      <a className={this.props.active && this.props.mouse != 1 ? 'active-class resultbutton' : 'resultbutton'}
          href={`/results/major/${subjectInfo.subShort.toUpperCase()}`}>
        <p className="result-label-subject">
          Major
        </p>
        <p className="result-text">{text}</p>
      </a>
    );
  }
}

// Requres course informaiton (database object) to generate course title, and uses the query to
// determine styling of output
Course.propTypes = {
  info: PropTypes.object.isRequired,
  query: PropTypes.string, //optional
  active: PropTypes.bool,
  enter: PropTypes.number,
  mouse: PropTypes.number,
  key: PropTypes.string
};

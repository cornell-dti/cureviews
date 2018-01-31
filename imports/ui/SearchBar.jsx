import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Classes } from '../api/classes.js';
import Course from './Course.jsx';
import "./css/SearchBar.css";

//SearchBar component - contains a search bar and results of a user course search
export class SearchBar extends Component {
  constructor(props) {
    console.log("constructing the searchbar");
    super(props);
  }

  renderCourses() {
    if (this.props.query !== "") {
      results = this.props.allCourses.slice(0,100).map((course) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <Course key={course._id} info={course}/>
      ));
      console.log("results", results);
      return results;
    }
    else {
      return <div />;
    }
  }

  render() {
    return (
      <div className="search-bar text-left" id="searchbar">
        <input className="search-text" id="search" onChange={this.props.queryFunc} placeholder="Search for classes (e.g. CS 2110, Intro to Creative Writing)"/>
        <ul id="output">
          {this.renderCourses()}
        </ul>
      </div>
    );
  }
}

SearchBar.propTypes = {
  allCourses: PropTypes.array.isRequired,
  loading: React.PropTypes.bool,
  query: PropTypes.string.isRequired,
  queryFunc: PropTypes.func.isRequired
};

export default createContainer((props) => {
  const subscription = Meteor.subscribe('classes', props.query);
  const loading = !subscription.ready();
  const allCourses = Classes.find({}).fetch();
  return {
    allCourses, loading,
  };
}, SearchBar);

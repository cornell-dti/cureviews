import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Classes } from '../api/classes.js';
import Course from './Course.jsx';
import "./css/SearchBar.css";

//SearchBar component - contains a search bar and results of a user course search
export class SearchBar extends Component {
  constructor(props) {
    super(props);
  }

  renderCourses() {
    if (this.props.query != "") {
      return this.props.allCourses.slice(0,10).map((course) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <Course key={course._id} info={course} handler={this.props.clickFunc}/>
      ));
    } else {
      return <div />;
    }
  }

  render() {
    return (
      <div  id="searchbar">
        <input id="search" onChange={this.props.queryFunc} placeholder="CS 2110, Intro to Creative Writing"/>
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
  queryFunc: PropTypes.func.isRequired,
  clickFunc: PropTypes.func.isRequired
};

export default createContainer((props) => {
  const subscription = Meteor.subscribe('classes', props.query);
  const loading = !subscription.ready();
  const allCourses = Classes.find({}).fetch();
  return {
    allCourses, loading,
  };
}, SearchBar);

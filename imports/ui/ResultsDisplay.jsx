import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { CollectionName } from '../api/dbDefs.js';
import "./css/Results.css"; // css files
import FilteredResult from './FilteredResult.jsx';
import SearchBar from './SearchBar.jsx';
import PreviewCard from './PreviewCard.jsx';


/*
  Results Component. Short description if needed.

  Identify as one of the following components:
  Simple styling: mainly renders HTML and CSS,
  Container: combines multiple components into a single feature
  View: top-level component accessed by a URL endpoint defined by the router in main.jsx

  Include a breif description of the component's purpose, where it falls in the
  component tree, and any inportant information it accesses or modifies.
  Include the route for View components.
*/

export default class ResultsDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseList: this.props.courses,
      card_course: this.props.courses[0],
    };

    this.previewHandler = this.previewHandler.bind(this);

  }


  renderResults() {
    return this.state.courseList.map((result, index) => (
      <FilteredResult key={index} course={result} previewHandler={this.previewHandler} />
    ));

  }

  previewHandler(course) {
    this.setState({ card_course: course });
  }


  render() {
    return (
      <div>
        <div id="results">
          <ul>

            {this.renderResults()}
          </ul>
        </div>
        <div id="preview">
          <PreviewCard course={this.state.card_course} />
        </div>
      </div>
    );
  }
}

ResultsDisplay.propTypes = {
  courses: PropTypes.array.isRequired
};


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./css/ResultsDisplay.css"; // css files
import FilteredResult from './FilteredResult.jsx';
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
      <div className="row">
        <div className="col-md-2 col-sm-2 col-xs-2">
          Filters
        </div>
        <div className="col-md-6 col-sm-6 col-xs-6" id="results">
          <ul>
            {this.renderResults()}
          </ul>
        </div>
        <div className="col-md-4 col-sm-4 col-xs-4" id="preview">
          <PreviewCard course={this.state.card_course} />
        </div>
      </div>
    );
  }
}

ResultsDisplay.propTypes = {
  courses: PropTypes.array.isRequired
};


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
      active_card: 0,
    };

    this.previewHandler = this.previewHandler.bind(this);

  }

  renderResults() {
    return this.state.courseList.map((result, index) => (
      <FilteredResult key={index} index={index} border_color={index == this.state.active_card ? "solid 1px #4a90e2" : "solid 0.5px #d8d8d8"} course={result} previewHandler={this.previewHandler} />
    ));

  }

  previewHandler(course, index) {
    this.setState({
      card_course: course,
      active_card: index
    });
  }


  render() {
    return (
      <div className="row">
        <div className="col-md-2 col-sm-2 col-xs-2">
          Filters
        </div>
        <div className="col-md-5 col-sm-5 col-xs-5" id="results">
          <ul>
            {this.renderResults()}
          </ul>
        </div>
        <div className="col-md-5 col-sm-5 col-xs-5">
          <PreviewCard course={this.state.card_course} />
        </div>
      </div>
    );
  }
}

ResultsDisplay.propTypes = {
  courses: PropTypes.array.isRequired
};


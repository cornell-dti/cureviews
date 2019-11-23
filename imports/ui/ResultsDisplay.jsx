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
      selected: "rating"
    };

    this.previewHandler = this.previewHandler.bind(this);
    this.sortDesc = this.sort.bind(this);

  }

  handleSelect = (event) => {
    var opt = event.target.value;
    this.setState({ selected: opt }, () => this.sort());

  }

  sort() {
    if (this.state.selected == "rating") {
      var data = this.state.courseList.sort((a, b) => (b.classRating - a.classRating));
      this.setState({ courseList: data });
    }
    else if (this.state.selected == "diff") {
      var data = this.state.courseList.sort((a, b) => (a.classDifficulty - b.classDifficulty));
      this.setState({ courseLIst: data });

    }
    else if (this.state.selected == "work") {
      var data = this.state.courseList.sort((a, b) => ((a.classWorkload == null ? Number.MAX_SAFE_INTEGER : a.classWorkload) - (b.classWorkload == null ? Number.MAX_SAFE_INTEGER : b.classWorkload)));
      this.setState({ courseList: data });
    }

  }

  renderResults() {
    console.log("current state " + this.state.courseList[0].classDifficulty);
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
        <div className="col-md-1 col-sm-1 col-xs-1">
          Filters
        </div>
        <div className="col-md-1 col-sm-1 col-xs-1">
          <select className="browser-default custom-select" onChange={(e) => this.handleSelect(e)}>
            <option value="rating">Overall Rating</option>
            <option value="diff" >Difficulty</option>
            <option value="work">Workload</option>
          </select>
        </div>
        <div className="col-md-5 col-sm-5 col-xs-5" id="results">
          <ul>
            {this.renderResults()}
          </ul>
        </div>
        <div className="col-md-5 col-sm-5 col-xs-5" id="preview">
          <PreviewCard course={this.state.card_course} />
        </div>
      </div>
    );
  }
}

ResultsDisplay.propTypes = {
  courses: PropTypes.array.isRequired
};


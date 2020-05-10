import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { lastOfferedSems } from 'common/CourseCard';
import './css/FilteredResult.css';

type Props ={
  course: any;
  previewHandler: (arg1:any,arg2:any) => any;
  selected: boolean;
  index: number;
  sortBy: string;
}

type State = {
  course: any;
  current_index: number;
  sortBy: string;
}
/*
  Filtered Result Component.

  Takes each result and creates a view of the result with its s

  Props:  course- the class to be displayed
          previewHandler: if this class is clicked, this function will update
                          the selected class to display a PreviewCard
                          in the ResultsDisplay component to be itself
          selected: bool, if true, the border of this class is outlined blue to indicate being clicked
          index: number, the position of this class in the list of results
          sortBy: string, the metric to display on this component
*/

export default class FilteredResult extends Component<Props,State> {
  constructor(props:Props) {
    super(props);
    // set gauge values
    this.state = {
      course: this.props.course,
      current_index: this.props.index,
      sortBy: this.props.sortBy
    };

    this.getColor = this.getColor.bind(this);
    this.updateSortBy = this.updateSortBy.bind(this);
    this.updateSortByTitle = this.updateSortByTitle.bind(this);

  }

  componentDidUpdate(prevProps:Props) {
    if (prevProps !== this.props) {
      this.setState({
        course: this.props.course,
        current_index: this.props.index,
        sortBy: this.props.sortBy
      })
    }
  }

  //Returns the color corresponding to the [val] for the [metric]
  getColor(metric:string, val:any) { 
    if (metric === "Overall Rating" || metric === "Relevance") {
      if (val !== "?" && 3.0 <= val && val < 4.0) {
        return "#f9cc30";
      }
      else if (val !== "?" && 4.0 <= val && val <= 5.0) {
        return "#53B277";
      }
      else {
        return "#E64458";
      }
    }
    else if (metric === "Difficulty" || metric === "Workload") {
      if (val !== "?" && 3.0 <= val && val < 4.0) {
        return "#f9cc30";
      }
      else if (val === "?" || (4.0 <= val && val <= 5.0)) {
        return "#E64458";
      }
      else {
        return "#53B277";
      }
    }
  }

  //Returns the corresponding number of the class's metric based on the [sortBy] metric
  //Returns ? if it is null
  updateSortBy() {
    if (this.state.sortBy === "rating" || this.state.sortBy === "relevance") {
      return Number(this.state.course.classRating) ? this.state.course.classRating : "?";
    }
    else if (this.state.sortBy === "diff") {
      return Number(this.state.course.classDifficulty) ? this.state.course.classDifficulty : "?";
    }
    else if (this.state.sortBy === "work") {
      return Number(this.state.course.classWorkload) ? this.state.course.classWorkload : "?";
    }
  }

  //Returns the corresponding name of the class's metric based on the [sortBy] metric
  updateSortByTitle() {
    if (this.state.sortBy === "rating" || this.state.sortBy === "relevance") {
      return "Overall Rating";
    }
    else if (this.state.sortBy === "diff") {
      return "Difficulty";
    }
    else if (this.state.sortBy === "work") {
      return "Workload";
    }
  }

  render() {
    let theClass = this.props.course;
    let offered = lastOfferedSems(theClass);
    return (
      <li className={this.props.selected === true ? "result-card result-card-clicked" : " result-card"}
        onClick={() => { this.props.previewHandler(this.state.course, this.state.current_index) }}>
        <div className="">
          <h1 className="result-card-title">
            {theClass.classTitle}
          </h1>
          <h2 className="result-card-subtitle">
            {theClass.classSub.toUpperCase() + " " + theClass.classNum + ", " + offered}
          </h2>
          <div className="result-card-rating-text">
            <p className="result-card-sort-by-text">
              <strong>{this.updateSortByTitle()}</strong>
            </p>
            <p className="result-card-sort-by-value">
              {this.updateSortBy()}
            </p>
            <p>
              /5
            </p>
          </div>
        </div>
      </li>
    );
  }
}

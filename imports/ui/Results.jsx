import React, { Component } from 'react';
import "./css/Results.css"; // css files
import Navbar from './Navbar.jsx';
import ResultsDisplay from './ResultsDisplay.jsx';
import PropTypes from "prop-types";


/*
  Results Component.

  Used to render the results page. Uses Navbar and ResultsDisplay components directly.
  
  Props: uses params from URL
*/

export class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseList: [],
      loading: true
    };

    this.updateResults = this.updateResults.bind(this);

  }

  updateResults(){
    if (this.props.match.params.type === "major") {
      Meteor.call("getCoursesByMajor", this.props.match.params.input.toLowerCase(), (err, courseList) => {
        if (!err && courseList.length != 0) {
          // Save the Class object that matches the request
          this.setState({
            courseList: courseList,
            loading: false
          });
        }
        else {
          this.setState({
            courseList: [],
            loading: false
          });
        }
      });
    }
    else if (this.props.match.params.type === "keyword") {
      let userQuery = this.props.match.params.input.split("+").join();
      Meteor.call("getCoursesByKeyword", userQuery, (err, courseList) => {
        if (!err && courseList.length != 0) {
          // Save the Class object that matches the request
          this.setState({
            courseList: courseList,
            loading: false
          });
        }
        else {
          Meteor.call("getClassesByQuery", userQuery, (err, queryCourseList) => {
            if (!err && queryCourseList.length != 0) {
              // Save the Class object that matches the request
              this.setState({
                courseList: queryCourseList,
                loading: false
              });
            }
            else {
              this.setState({
                courseList: [],
                loading: false
              });
            }
          })
        }
      });
    }
  }

  componentDidUpdate(prevProps){
    if (prevProps != this.props) {
      this.setState({
        courseList: [],
        loading: true
      });
      this.updateResults();
    }
  }

  componentDidMount() {
    this.updateResults();
  }

  render() {
    return (
      <div>
        <div className="container-fluid container-top-gap-fix">
          <Navbar />
          <ResultsDisplay courses={this.state.courseList} loading={this.state.loading} />
        </div>
      </div>
    )
  }

}

Results.propTypes = {
  match: PropTypes.object
};
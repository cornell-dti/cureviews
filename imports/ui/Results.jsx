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
      query: '',
      loading: true
    };

  }

  componentDidMount() {
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
          this.setState({
            courseList: [],
            loading: false
          });
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    //if this component receives new props from the Redirect, it resets its state so that it can render/mount
    //a new ClassView component with the new props


    this.setState({
      selectedClass: null,
      classDoesntExist: false,
      query: '',
    });
    this.componentDidMount()
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
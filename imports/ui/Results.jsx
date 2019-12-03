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
    };

  }

  componentDidMount() {
    if (this.props.match.params.type === "major") {
      Meteor.call("getCoursesByMajor", this.props.match.params.input.toLowerCase(), (err, courseList) => {
        if (!err && courseList.length != 0) {
          // Save the Class object that matches the request
          this.setState({
            courseList: courseList
          });
        }
        else {
          this.setState({
            courseList: []
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
            courseList: courseList
          });
        }
        else {
          this.setState({
            courseList: []
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
          <ResultsDisplay courses={this.state.courseList} noResults={this.state.courseList.length == 0} />
        </div>
      </div>
    )
  }

}


// Define the names, types and optional status of the props that will be passed
// to this component from the parent component that creates it.
// Be sure to include any collections obtained from withTracker!

// describe props

// If the component needs to access data from the database, it must be wrapped
// inside a container that can subscribe to a meteor collection.
//
// withTracker encapsulates the component and subscribes to the published version
// of a specified Meteor collections (defined in server/publications.js),
// passing it to the component as a prop. This subscription will automatically
// update whenever its database collection changes and will trigger a component re-render.
// Look at the publishers in server/publications.js for more information about publishers and subscribers.

// Explain which collections this componet will subscribe to, and what data is expected to be returned.
// export default withTracker((props) => {
//   const subscription = Meteor.subscribe('classes', parameter1InPublisher, parameter2InPublisher); //get collection as lowercase name from ../api/dbInit.js
//   const loading = !subscription.ready();
//   const collectionAsObjectList = CollectionName.find({}).fetch();
//   return {
//     collectionAsObjectList,
//   };
// }, Template);

Results.propTypes = {
  match: PropTypes.object
};
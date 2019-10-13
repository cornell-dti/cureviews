import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { CollectionName } from '../api/dbDefs.js';
import "./css/App.css"; // css files
import FilteredResult from './FilteredResult.jsx';
import SearchBar from './SearchBar.jsx';

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

export class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseList: this.props.filterResults,
      query: '',
    };

    this.updateQuery = this.updateQuery.bind(this);

  }

  updateQuery(event) {
    // trim the query to remove trailing spaces      
    this.setState({ query: event.target.value.trim() });
    //Session to be able to get info from this.state.query in withTracker
    Session.set('querySession', this.state.query);
  }



  //TODO: mount component. How do I get component to load? Is Search calling it?
  //props as list of course objects

  //What exactly am I receiving from the filter search? list of Course objects

  componentWillMount() {

    Meteor.call("getCourseByFilters", {
      "classRating": "4.4",
      "classGrade": "A-"
    }, (err, courseList) => {
      if (!err && courseList) {
        // Save the Class object that matches the request
        this.setState({
          courseList: courseList
        });
      }
      else {
        // No class matches the request.
        console.log("no");
        this.setState({
          courseList: []
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    //if this component receives new props from the Redirect, it resets its state so that it can render/mount
    //a new ClassView component with the new props
    const number = nextProps.match.params.number;
    const subject = nextProps.match.params.subject.toLowerCase();


    this.state = {
      number: number,
      subject: subject,
      selectedClass: null,
      classDoesntExist: false,
      query: '',
    };
    this.componentWillMount()
  }

  // renderResults() {
  //   return this.state.courseList.map((result) => (
  //     <FilteredResult course={result} />
  //   ));
  //   // return this.props.filterResults.map((result) => (
  //   //   <FilteredResult course={result} />
  //   // ));
  // }


  render() {
    return (
      <div className="container-fluid container-top-gap-fix">
        <div className="row navbar">
          <div className="col-md-2 col-sm-2 col-xs-2">
            <a className="cornell-reviews title-link navbar-brand" id="navname" href="/">
              <span>CU Reviews</span>
            </a>
          </div>
          <div className="col-md-7 col-sm-7 col-xs-7">
            <SearchBar query={this.state.query} queryFunc={this.updateQuery} />
          </div>
          <div className="col-md-3 col-sm-3 col-xs-3 fix-padding">
            <a id='report-bug' href="https://goo.gl/forms/twC1E0RsWlQijBrk2" target="_blank"> Report a Bug</a>
          </div>
        </div>
      </div>

      // <section>
      //   <legend className="subheader">Results</legend>
      //   <div className="panel panel-default" id="reviewpanel">
      //     <div>
      //       <ul id="reviewul">
      //         Hi
      //         {/* {this.renderResults()} */}
      //       </ul>
      //     </div>
      //   </div>
      // </section>
    );
  }
}

// Define the names, types and optional status of the props that will be passed
// to this component from the parent component that creates it.
// Be sure to include any collections obtained from withTracker!

// describe props
Results.propTypes = {
  filterResults: PropTypes.array.isRequired
};

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

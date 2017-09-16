import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Classes } from '../api/classes.js';
import Form from './Form.jsx';
import Course from './Course.jsx';
import CourseCard from './CourseCard.jsx';
import SearchBar from './SearchBar.jsx';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedClass: null,
      query: ""
    }

    // bind functions called in other files to this context, so that current state is still accessable
    this.handleSelectClass = this.handleSelectClass.bind(this);
    this.updateQuery = this.updateQuery.bind(this);
  }

  //get the full class details for the clicked class. Called in Course.jsx
  handleSelectClass(classId) {
    Meteor.call('getCourseById', classId, (error, result) => {
      if (!error) {
        this.setState({selectedClass: result, query: ""});
      } else {
        console.log(error)
      }
    });
  }

  //set the state variable to the current value of the input. Called in SearchBar.jsx
  updateQuery(event) {
    this.setState({query: event.target.value});
  }

  //check if a class is selected, and show a coursecard only when one is.
  renderCourseCard() {
    var toShow = <div />; //empty div
    if (this.state.selectedClass != null) {
      toShow = <CourseCard course={this.state.selectedClass}/>;
    }
    return toShow;
  }

  renderForm() {
    var toShow = <div />;
    if (this.state.selectedClass != null) {
      toShow = <Form courseId={this.state.selectedClass._id}/>;
    }
    return toShow;
  }
  render() {
    return (
      <div className="container">
        <div className='row'>
          <SearchBar query={this.state.query} queryFunc={this.updateQuery} clickFunc={this.handleSelectClass}/>
        </div>
        <div className='row'>
          <div className="col-md-6">
            {this.renderCourseCard()}
          </div>
          <div className="col-md-6 panel-container fix-contain">
            {this.renderForm()}
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {};

export default createContainer((props) => {return {};}, App);

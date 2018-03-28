import React, { Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Classes } from '../api/dbDefs.js';
import Course from './Course.jsx';


/*
  Popular Classes Component.

  Simple styling component that renders a list of the top 10 courses with the
  most reviews. When the course is clicked, the user is taken
  to the course's ClassView.

  The course is rendered as  li element through the Course component, and has
  no underlining since no query is provided.
*/

export default class PopularClasses extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topClasses: [] //defult to empty list
    };

    // get the top classes by number of reviews, using a Meteor function
    // defined in imports/api/classes
    var x = Meteor.call('topClasses', (error, result) => {
      if (!error) {
        this.setState({topClasses: result});
      } else {
        console.log(error)
      }
    });
  }

  // convert the list of class objects into a styled list of courses.
  // Course will act as a button, such that clicking a course will take the user
  // to that class's ClassView.
  renderCourses() {
    if (this.state.topClasses !== []) {
      return this.state.topClasses.map((course) => (
        <Course key={course._id} info={course} />
      ));
    } else {
      return <div />;
    }
  }

  render() {
    return (
      <section>
        <legend className="subheader">Popular Classes</legend>
        <div className="panel panel-default" id="reviewpanel">
            <div>
                <ul id="reviewul">
                    {this.renderCourses()}
                </ul>
            </div>
        </div>
      </section>
    );
  }
}

// takes in no props
PopularClasses.propTypes = {};

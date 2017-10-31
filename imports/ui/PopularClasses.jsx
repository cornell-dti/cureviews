import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Classes } from '../api/classes.js';
import Course from './Course.jsx';

// Holder component to list all (or top) reviews for a course.
// Takes in course ID for selecting reviews.
export class PopularClasses extends Component {
  constructor(props) {
    super(props);

    // bind functions called in other files to this context, so that current state is still accessable
    this.handleSelectClass = this.handleSelectClass.bind(this);
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

  renderCourses() {
    if (this.props.query != "") {
      return this.props.allCourses.slice(0,10).map((course) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <Course key={course._id} info={course} handler={this.props.clickFunc}/>
      ));
    } else {
      return <div />;
    }
  }

  render() {
    return (
      <section>
				<legend className="subheader">Popular Classes</legend>
			    <div className= "panel panel-default" id= "reviewpanel">
			    	<div>
						<ul id= "reviewul">
				       {this.renderCourses()}
						</ul>
					</div>
				</div>
			</section>
    );
  }
}

//props:
PopularClasses.propTypes = {
  allCourses: PropTypes.array.isRequired,
  clickFunc: PropTypes.func.isRequired
};

// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default createContainer((props) => {
  const subscription = Meteor.subscribe('classes', "--");
  const loading = !subscription.ready();
  const allCourses = Classes.find({}).fetch();
  return {
    allCourses, loading,
  };
}, PopularClasses);

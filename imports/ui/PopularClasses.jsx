import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Classes } from '../api/classes.js';
import Course from './Course.jsx';

// Holder component to list all (or top) reviews for a course.
// Takes in function to execute when a class is clicked.
export default class PopularClasses extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topClasses: [] //defult to empty list
    }

    //get the top classes by number of reviews
    var x = Meteor.call('topClasses', (error, result) => {
      if (!error) {
        this.setState({topClasses: result});
      } else {
        console.log(error)
      }
    });
  }

  renderCourses() {
    if (this.state.topClasses != []) {
      return this.state.topClasses.slice(0,10).map((course) => (
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

//props
PopularClasses.propTypes = {
  clickFunc: PropTypes.func.isRequired
};

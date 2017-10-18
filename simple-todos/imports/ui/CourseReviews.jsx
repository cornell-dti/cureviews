import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Reviews } from '../api/classes.js';
import Review from './Review.jsx';

// Holder component to list all (or top) reviews for a course.
// Takes in course ID for selecting reviews.
export class CourseReviews extends Component {
  //props:
  //courseId, the course these reviews belong to

  renderReviews() {
    return this.props.reviews.map((review) => (
      <Review key={review._id} info={review}/>
    ));
  }

  render() {
    return (
      <section>
				<legend className="subheader">Past Reviews</legend>
			    <div className= "panel panel-default">
			    	<div>
						<ul>
				       {this.renderReviews()}
						</ul>
					</div>
				</div>
			</section>
    );
  }
}

//define the props for this object
CourseReviews.propTypes = {
  courseId: PropTypes.string.isRequired,
  reviews: PropTypes.array.isRequired
};

// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default createContainer((props) => {
  const subscription = Meteor.subscribe('reviews', props.courseId, 1); //get only visible reviews for this course
  const loading = !subscription.ready();
  const reviews = Reviews.find({}).fetch();
  return {
    reviews, loading,
  };
}, CourseReviews);

import React, { Component, PropTypes } from 'react';

//Simple Review component - represents a stored review shown to the user when a course is selected.
export default class Review extends Component {
  //props:
  // info, a database object containing all of this review entry's data.
  render() {
    var review = this.props.info;
    return (
			<li>
				<div className = "panel panel-default">
					<div className= "panel-heading" id="past">Name?</div>
					<div className = "panel-body">
					    <div className = "row">
					    	<div className = "col-sm-2">
					      		<div className = "panel panel-default">
                      <div className = "panel-body">{review.quality}</div>
					      		</div>
					      	</div>
					      	<div className = "col-sm-2">
					      		<p>Overall Quality</p>
					      	</div>
					    	<div className = "col-sm-2">
					      	<div className = "panel panel-default">
					      		<div className = "panel-body">{review.difficulty}</div>
					      	</div>
					    	</div>
					      	<div className = "col-sm-2">
					      		<p>Difficulty</p>
					      	</div>
					    </div>
					    <div className="row">
					   		<div className = "review-text">{review.text}</div>
					   	</div>
					</div>
				</div>
			</li>
    );
  }
}

Review.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  info: PropTypes.object.isRequired
};

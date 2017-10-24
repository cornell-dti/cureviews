import React, { Component, PropTypes } from 'react';
import './css/Review.css';

//Simple Review component - represents a stored review shown to the user when a course is selected.
export default class Review extends Component {
  //props:
  // info, a database object containing all of this review entry's data.

  render() {
    var review = this.props.info;
    return (
			<li id = "rectangle">
				<div className = "panel" >
					<div className = "panel-body">
					    <div className = "row">
					    	<div className = "col-sm-2">
					      		<div className = "container" id = "box">
                      				<div id = "text">{review.quality}</div>
					      		</div>
					      	</div>
					      	<div className = "col-sm-4">
					      		<p id = "label">Overall Quality</p>
					      	</div>
					    	<div className = "col-sm-2" >
					      	<div className = "container" id = "box">
					      		<div id = "text">{review.difficulty}</div>
					      	</div>
					    	</div>
					      	<div className = "col-sm-2">
					      		<p id = "label">Difficulty</p>
					      	</div>
					      	<div className = "col-sm-2">
					      		<button onClick={() => this.props.reportHandler(review)} id = "button_text">Report</button>
					      	</div>
					    </div>
					    <div className="row">
					   		<div className = "review-text" id = "review_text">{review.text}</div>
					   	</div>
					</div>
				</div>
			</li>
    );
  }

  // render() {
  //   var review = this.props.info;
  //   console.log("inner rev", review);
  //   return (
		// 	<li>
		// 		<div className = "panel panel-default">
		// 			<div className = "panel-body"  id = "full_review">

		// 			   <div className = "col-sm-4">
		// 			   	<div className = "col-sm-6">
		// 				   	<div className = "panel panel-default">
		// 					   	<div className ="panel-body" id = "full_review"> {review.quality} </div>
		// 					</div>
		// 					<div className = "panel panel-default">
		// 					   	<div className ="panel-body" id = "full_review"> {review.difficulty} </div>
		// 					 </div>
		// 				 </div>
		// 				 <div className = "col-sm-6">
		// 				 	<p> Overall Quality</p>
		// 				 	<br/>
		// 				 	<p> Difficulty</p>
		// 				 </div>

		// 				 </div>

		// 				 <div className = "col-sm-8">
		// 				 	<div className = "review-text">{review.text}</div>
		// 				 </div>
		// 				 <button onClick={() => this.props.reportHandler(review)}>Flag</button>
		// 			</div>
		// 		</div>
		// 	</li>
  //   );
  // }
}

Review.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  info: PropTypes.object.isRequired
};

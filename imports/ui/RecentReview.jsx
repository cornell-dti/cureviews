import React, { Component, PropTypes } from 'react';
import './css/Review.css';
import './css/RecentReview.css';

//Recent Review component - represents a review shown on the homepage.
export default class RecentReview extends Component {
  //props:
  // info, a database object containing all of this review entry's data.
  renderClassName(classId){
    var toShow = ''; //empty div //empty div
    return Meteor.call('getCourseById', classId, (error, result) => {
      if (!error) {
        toShow = result.classTitle;
        return result.classTitle;
      } else {
        console.log(error);
      }
    });
    return toShow;
  }

  render() {
    var review = this.props.info;
    var classId = review.class;
    return (
			<li>
        <div className="row">
          <div className = "col-sm-8">
          {/*{this.renderClassName(classId)}*/}
          <p className="classNameLink">Class Name + Posted Timestamp (Placeholder)</p>
          </div>
        </div>
				<div className= "review">
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

}

RecentReview.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  info: PropTypes.object.isRequired
};

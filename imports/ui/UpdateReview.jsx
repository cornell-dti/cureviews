import React, { Component, PropTypes } from 'react';

// Update Review component for the moderator interface. Allows approval and removal of reviews.
export default class UpdateReview extends Component {
  //props:
  // info, a database object containing all of this review entry's data.
  render() {
    var review = this.props.info;
    return (
      <li id={review._id}>
        <div className= "panel panel-default">
          <div className="panel-heading" id ="past"></div>
          <div className= "panel-body">
              <div className="row">
                <div className="col-sm-2">
                    <div className="panel panel-default">
                      <div className="panel-body">{review.quality}</div>
                    </div>
                    <div className= "panel panel-default">
                      <div className= "panel-body">{review.difficulty}</div>
                    </div>
                </div>
                <div className= "col-sm-2">
                    <div className= "panel-body"> Overall Quality</div>
                    <div className= "panel-body"> Level of difficulty</div>
                </div>
                <div className= "col-sm-8">{review.text}</div>
                <button onClick={() => this.props.approveHandler(review)}> Confirm Review</button>
                <button onClick={() => this.props.removeHandler(review)}> Remove Review</button>
              </div>
          </div>
        </div>
      </li>
    );
  }
}

UpdateReview.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  info: PropTypes.object.isRequired,
  approveHandler: PropTypes.func.isRequired,
  removeHandler: PropTypes.func.isRequired
};

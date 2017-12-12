import React, { Component, PropTypes } from 'react';

// Update Review component for the moderator interface. Allows approval and removal of reviews.
export default class UpdateReview extends Component {
  //props:
  // info, a database object containing all of this review entry's data.
  constructor(props) {
    super(props);

    // state of app will contain the class for this review
    this.state = {
      shortName: "",
      longName: "",
    };

    var x = Meteor.call('getCourseById', props.info.class, (error, result) => {
      if (!error) {
        this.setState({
          shortName: result.classSub.toUpperCase() + " " + result.classNum,
          longName: result.classTitle
        });
      } else {
        console.log(error)
      }
    });
  }

  //display buttons based on the type of update (report or approval)
  renderButtons(review) {
      var reported = review.reported;
      if (reported === 1) {
          return (
              <div>
                  <button onClick={() => this.props.unReportHandler(review)}> Restore Review</button>
                  <button onClick={() => this.props.removeHandler(review)}> Remove Review</button>
              </div>
          )
      }
      else {
          return (
              <div>
                  <button onClick={() => this.props.approveHandler(review)}> Confirm Review</button>
                  <button onClick={() => this.props.removeHandler(review)}> Remove Review</button>
              </div>
          )
      }
  }

  render() {
      var review = this.props.info;
      return (
          <li id={review._id}>
            <div className="row">
              <div className="col-sm-12">
                <b>Course:</b> {this.state.shortName}: {this.state.longName}
                <br></br>
                <b>Posted </b> {moment(review.date.toString()).fromNow()}
              </div>
            </div>
              <div className="panel panel-default">
                  <div className="panel-body">
                      <div className="row">
                          <div className="col-sm-2">
                              <div className="panel panel-default">
                                  <div className="panel-body">{review.quality}</div>
                              </div>
                              <div className="panel panel-default">
                                  <div className="panel-body">{review.difficulty}</div>
                              </div>
                          </div>
                          <div className="col-sm-2">
                              <div className="panel-body"> Overall Quality</div>
                              <div className="panel-body"> Level of difficulty</div>
                          </div>
                          <div className="col-sm-8">{review.text}</div>
                          {this.renderButtons(review)}
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

import React, { Component } from 'react';
import moment from 'moment';
import { Meteor } from "../meteor-shim";
import "./css/Review.css";

type Props ={
    info: any;
    approveHandler: (arg1:any) => any;
    removeHandler: (arg1:any) => any;

    //was origially optional
    unReportHandler: (arg1:any) => any;
};

type State = {
  shortName: string;
  longName: string;
};
/*
  Update Review Component.

  Simple styling component that renders a single review (an li element)
  to show on the Admin interface. Admin-visible reviews will be of 2 types:
  - Unapproved: new reviews needing approval
  - Reported: reviews that have been reprot and need review.

  Unapproved Reivews will contain:
  -  Name of the course the review belongs to
   - how long ago the review was added
   - all review content
   - button to approve the review
   - button to delete the review

  Reported Reivews will contain:
   -  Name of the course the review belongs to
    - how long ago the review was added
    - all review content
    - button to un-report (restore) the review
    - button to delete the review
*/

export default class UpdateReview extends Component<Props,State> {
  constructor(props:Props) {
    super(props);

    // state of app will contain details about the class this reivew is for
    this.state = {
      shortName: "",
      longName: "",
    };

    // Get details about the course this review belongs to, using the courseId
    // assigned to this review.
    Meteor.call('getCourseById', props.info.class, (error:any, result:any) => {
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

  // Decide which buttons to show, and what action the buttons take,
  // based on the type of update (report or approval)
  renderButtons(review:any) {
      const reported = review.reported;
      if (reported === 1) {
          return (
            <div className='text-right'>
              <button type="button" className="btn btn-success " onClick={() => this.props.unReportHandler(review)}> Restore Review</button>
              <button type="button" className="btn btn-danger space-review-buttons" onClick={() => this.props.removeHandler(review)}> Remove Review</button>
            </div>
          )
      }
      else {
          return (
            <div className='text-right'>
              <button type="button" className="btn btn-success" onClick={() => this.props.approveHandler(review)}> Confirm Review</button>
              <button type="button" className="btn btn-danger space-review-buttons" onClick={() => this.props.removeHandler(review)}> Remove Review</button>
            </div>
          )
      }
  }

  render() {
      const review = this.props.info;
      return (
          <li id={review._id}>
            <div className="row">
              <div className="col-sm-12">
                <b>Course:</b> {this.state.shortName}: {this.state.longName}
                <br></br>
                <b>Posted </b> {moment(review.date).fromNow()}
              </div>
            </div>
              <div className="panel panel-default">
                  <div className="panel-body">
                      <div className="col-sm-1">
                          <div className="panel panel-default">
                              <div className="panel-body text-center">{review.rating}</div>
                          </div>
                          <div className="panel panel-default">
                              <div className="panel-body text-center">{review.difficulty}</div>
                          </div>
                          <div className="panel panel-default">
                              <div className="panel-body text-center">{review.professors}</div>
                          </div>
                      </div>
                      <div className="col-sm-2">
                          <div className="panel-body"> Overall Rating</div>
                          <div className="panel-body"> Difficulty</div>
                          <div className="panel-body"> Professor(s)</div>
                      </div>
                      <div className="col-sm-9">
                        {review.text}
                        {this.renderButtons(review)}
                      </div>
                  </div>
              </div>
          </li>
      );
  }

}

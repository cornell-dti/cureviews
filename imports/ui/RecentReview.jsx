import React, { Component, PropTypes } from 'react';
import './css/Review.css';
import './css/RecentReview.css';

//Recent Review component - represents a review shown on the homepage.
export default class RecentReview extends Component {
  //props:
  // info, a database object containing all of this review entry's data.
  constructor(props) {
    super(props);

    // state of app will contain the class for this review
    this.state = {
      shortName: "",
      longName: "",
      link: "",
    };

    var x = Meteor.call('getCourseById', props.info.class, (error, result) => {
      if (!error) {
        this.setState({
          shortName: result.classSub.toUpperCase() + " " + result.classNum,
          longName: result.classTitle,
          link: '/course/'+ result.classSub.toUpperCase() + "/" + result.classNum,
        });
      } else {
        console.log(error)
      }
    });
  }

    //get color for quality value
  getQualColor(value) {
    var colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value],
    };
}


  render() {
    var review = this.props.info;

    return (
        <li>
            <div className="row">
              <div className="col-sm-12">
                <a className="classNameLink" href={this.state.link}>
                  <b><u>{this.state.shortName}</u></b>: {this.state.longName}
                </a>
                <p><i>{moment(review.date.toString()).fromNow()}</i></p>
              </div>
            </div>
            <div className="review">
                <div className="panel-body">
                    <div className="row reviewNumbers">
                        <div className="col-md-2 col-xs-2 col-xs-2">
                            <div className="container" id="box" style={this.getQualColor(review.quality)}>
                                <div id="text">{review.quality}</div>
                            </div>
                        </div>
                        <div className="col-md-4 col-sm-4 col-xs-4">
                            <p id="label">Overall Quality</p>
                        </div>
                        <div className="col-md-2 col-sm-2 col-xs-2" >
                            <div className="container" id="box" style={this.getQualColor(5 - review.difficulty)}>
                                <div id="text">{review.difficulty}</div>
                            </div>
                        </div>
                        <div className="col-md-2 col-sm-2 col-xs-2">
                            <p id="label">Difficulty</p>
                        </div>
                        <div className="col-sm-2 col-sm-2 col-xs-2">
                            <button id="button_text" onClick={() => {this.props.reportHandler(review); alert('This post has been reported and will be reviewed.')}}>Report</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="review-text" id="review_text">{review.text}</div>
                    </div>
                </div>
            </div>
        </li>
    );
  }
}

RecentReview.propTypes = {
  info: PropTypes.object.isRequired,
};

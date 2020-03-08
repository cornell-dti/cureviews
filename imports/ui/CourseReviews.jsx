import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import Review from './Review.jsx';
import RecentReview from './RecentReview.jsx';
import './css/CourseReviews.css';

/*
  Course Reviews Component.

  Container component that takes in the course's database id and returns:
  If course Id is valid:
    a list of all reviews for a course, sorted by date.
    The component also handles user reporting of reviews.

  If course id = -1:
    - list of 5 most recent reviews added to the database
*/

export class CourseReviews extends Component {
  constructor(props) {
    super(props);
    this.state={comparator:"helpful", reviews:[]};
    this.reportReview.bind(this);
    this.handleSelect=this.handleSelect.bind(this);
    this.sort=this.sort.bind(this);
    this.componentDidMount=this.componentDidMount.bind(this);
  }

  componentDidMount(){
    Meteor.call("getReviewsByCourseId", this.props.courseId, (err, reviews)=>{
      this.setState({reviews:this.sort(this.renderReviews(reviews))});

    });
  }


  // Handles selecting different sort bys
  handleSelect = (event) => {
    let opt = event.target.value;
    this.setState({ comparator: opt });
    this.setState({reviews:this.sort(this.state.reviews)});
  }

  sort(reviews){if(this.state.comparator==="helpful") return reviews.sort(function(a,b){
    if( b.props.info && a.props.info){
      if (a.props.info.likes < b.props.info.likes) {
        return -1;
      }
      if (a.props.info.likes > b.props.info.likes) {
        return 1;
      }
    }

    else return 0;
  })
  else return reviews.sort(function(a,b){
    if (b.props.info && a.props.info){
      if (a.props.info.date > b.props.info.date) {
        return -1;
      }
      if (a.props.info.date < b.props.info.date) {
        return 1;
      }
    }
    else return 0;
  });
    
  }

  // Report this review. Find the review in the local database and change
  // its 'reported' flag to true.
  reportReview(review) {
    console.log(review);
    Meteor.call('reportReview', review, (error, result) => {
      if (!error && result === 1) {
        console.log("reported review #" + review._id);
      } else {
        console.log(error)
      }
    });
  }

  // Loop through the list of reivews and render them (as a list)
  renderReviews(reviews) {
    let reviewCompList=[];
    if (this.props.courseId === "-1") {
       reviews.forEach((review) => (
        reviewCompList.push(<RecentReview key={review._id} info={review} reportHandler={this.reportReview} />)
      ));
    } else {
       reviews.forEach((review) => (
        reviewCompList.push(<Review key={review._id} info={review} reportHandler={this.reportReview} isPreview={false}/>)
      ));
      return reviewCompList;
    }
  }

  render() {
    let title = "Past Reviews ("+this.props.reviews.length+")";
    if (this.props.courseId === "-1") {
      title = "Recent Reviews";
    }
    return (
      <section>
        <div className="reviewHeader">
          <div className="past-reviews">{title}</div>
          <div className="sortWrapper">
            <div className="sort"> Sort By: 
              <select onClick={this.handleSelect} className="browser-default">
                          <option value="helpful">Most Helpful</option>
                          <option value="rating">Recent</option>
                        </select>
            </div>
        </div>  
        </div>
        <div className="panel panel-default" id="reviewpanel">
          <div>
            <ul id="reviewul">
              {this.state.reviews}
            </ul>
          </div>
        </div>
      </section>
    );
  }
}

// Component requires a course object pivided by a parent component, and uses
// withTracker to get a list of reviews.
CourseReviews.propTypes = {
  courseId: PropTypes.string.isRequired,
  reviews: PropTypes.array.isRequired,
};

// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default withTracker(props => {
  const subscription = Meteor.subscribe('reviews', props.courseId, 1, 0, ""); //get only visible unreported reviews for this course
  const loading = !subscription.ready();
  const reviews = Reviews.find({}).fetch();
  return {
    reviews, loading,
  };
})(CourseReviews);

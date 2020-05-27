import React, { Component, useEffect, useState } from 'react';
import { Meteor } from "../meteor-shim";
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
      this.setState({reviews:this.renderReviews(reviews)});
      this.sort(this.state.comparator);
    });
  }

  componentDidUpdate(prevProps){
    if (prevProps !== this.props)
    Meteor.call("getReviewsByCourseId", this.props.courseId, (err, reviews)=>{
      this.setState({reviews:this.renderReviews(reviews)});
      this.sort(this.state.comparator);
    });
  }


  // Handles selecting different sort bys
  handleSelect = (event) => {
    let opt = event.target.value;
    this.setState({ comparator: opt });
    this.sort(opt);
  }

  sort(comp){
    let reviews=this.state.reviews;
    let data=[];
    if(comp==="helpful") data= reviews.sort((a,b) => {
      if( !b.props.info.likes) return -1;
      if( !a.props.info.likes) return 1;
    if( b.props.info && a.props.info){
      if (a.props.info.likes > b.props.info.likes) {
        return -1;
      }
      if (a.props.info.likes < b.props.info.likes) {
        return 1;
      }
    }

    return 0;
  })
  else data= reviews.sort((a,b) => {
    if( !b.props.info.date) return 1;
    if( !a.props.info.date) return -1;
    if (b.props.info && a.props.info){
      console.log(a.props.info.date+" "+a.props.info.date);
      if (a.props.info.date > b.props.info.date) {
        return -1;
      }
      if (a.props.info.date < b.props.info.date) {
        return 1;
      }
    }
    return 0;
  });

  this.setState({reviews:data});
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

      <div>
        <div className="coursereviews-header">
          <div className="coursereviews-past-reviews-text">
            {title}
          </div>
          <div className="coursereviews-sort-container">
            <div className="coursereviews-sort"> Sort By:
              <select onChange={this.handleSelect} className="coursereviews-sort-options">
                <option  value="helpful">Most Helpful</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <ul className="coursereviews-review-ul">
            {this.state.reviews}
          </ul>
        </div>
      </div>
    );
  }
}



// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    Meteor.subscribe("reviews", courseId, 1, 0, "", (err, reviews) => {
      setReviews(reviews);
      setLoading(false);
    });
  }, [courseId]);

  return <CourseReviews courseId={courseId} reviews={reviews} loading={loading} />;
};

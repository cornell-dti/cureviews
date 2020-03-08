import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './css/Review.css';
import ShowMoreText from 'react-show-more-text';

/*
  Review Component.

  Simple styling component that renders a single review (an li element)
  to show in a ClassView. These reivews will include:
   - how long ago the reivew was added
   - all review content
   - report button
   - like button
*/

export default class Review extends Component {
  constructor(props) {
    super(props);
    this.state = {
      liked: false, //indicates whether or not the review has been liked in the current state
      numLikes: this.props.likes, //the number of likes on the PreviewCard review,
      expanded:false,
      height:186
    }

    this.circlebox_class = props.isPreview ? "circlebox-preview" : "circlebox";
    this.review_number_text_class = props.isPreview ? "review-number-text-preview" : "review-number-text";
    this.review_number_label_class = props.isPreview ? "review-number-label-preview" : "review-number-label";
    this.professor_title_class = props.isPreview ? "professor-title-preview" : "professor-title";
    this.review_text_class = props.isPreview ? "review-text-preview" : "review-text";
    this.professor_text_class = props.isPreview ? "professor-text-preview" : "professor-text";
    this.reviewToSemester=this.reviewToSemester.bind(this);
    this.executeOnClick=this.executeOnClick.bind(this);
  }

  executeOnClick(){
    
    if(!this.state.expanded){
      let newHeight=this.state.height+(this.props.info.text.length%500)/20*10;
      this.setState({expanded:!this.state.expanded, height:newHeight});
    }
    else{
      this.setState({expanded:!this.state.expanded, height:186});
    }
  }


  // Function to convert the classId assigned to this review into the
  // full, human-readable name of the class.
  renderClassName(classId) {
    return Meteor.call('getCourseById', classId, (error, result) => {
      if (!error) {
        return result.classTitle;
      } else {
        console.log(error);
      }
    });
  }

  // Convert the reviews's value to a color starting with red and ending with green.
  getColorRedToGreen(value) {
    const colors = ["#E64458", "#E64458", "#f9cc30", "#f9cc30", "#53B277", "#53B277"];
    return {
      backgroundColor: colors[value]
    }
  }

  // Convert the reviews's value to a color starting with green and ending with red.
  getColorGreenToRed(value) {
    const colors = ["#53B277", "#53B277", "#f9cc30", "#f9cc30", "#E64458", "#E64458"];
    if (value == undefined) return { backgroundColor: "#a9a9a9" }
    else return {
      backgroundColor: colors[value],
    }
  }

  // Function that checks whether or not the review has already been liked
  // in the current state. If so, the number of likes decreases by 1 as if removing a like.
  // Otherwise, the number of likes increases by 1.
  increment(review) {
    console.log("here");
    if (this.state.liked == false) {
      return Meteor.call('incrementLike', review._id, (error, result) => {
        if (!error && result === 1) {
          this.setState({
            liked: true,
            numLikes: this.state.numLikes + 1 //updates the likes on the PreviewCard review in realtime
          })
          console.log(this.state.liked);
          console.log("Likes: " + review.likes);
        } else {
          console.log(error)
        }
      });
    }
    else {
      return Meteor.call('decrementLike', review._id, (error, result) => {
        if (!error && result === 1) {
          this.setState({
            liked: false,
            numLikes: this.state.numLikes - 1
          })
          console.log("Likes: " + review.likes);
        } else {
          console.log(error)
        }
      });
    }
  }

  reviewToSemester(review) {

    let review_year = review.date.getFullYear();
    let review_month = review.date.getMonth()+1; 
    let review_day = review.date.getDate();

    return review_month+"/"+review_day+"/"+review_year;
  }

  render() {
    const review = this.props.info;
    console.log("prop" + this.props.likes);
    // console.log(review);
    // console.log(review.rating);
    return (
      <div className="review" style={this.expanded ? {height:this.state.height} : {}} >
        {
          !this.props.isPreview && 
          <div className="row noLeftRightSpacing">
            <div className="col-md-12 col-xs-12 col-xs-12">
              <button className="report-review" onClick={() => {
                this.props.reportHandler(review);
                alert('This post has been reported and will be reviewed.');
              }}>
                <span className="glyphicon glyphicon-flag"
                ></span>
              </button>
            </div>
          </div>
        }
        <div className="panel-body-3">
        <div className="col-md-2 reviewNumbers">
        
            <p className={this.review_number_label_class}>Overall</p>
            
            <p className={this.review_number_label_class}>Difficulty</p>

            <p className={this.review_number_label_class}>Workload</p>

            </div>
          <div className="col-md-2 numbers" style={this.state.expanded ? {height:this.state.height-70} :{height:this.state.height-90}}>
            <div className="metric-text" id={this.circlebox_class}>
                <p className={this.review_number_text_class} >{(review.rating != undefined) ? review.rating : review.quality}</p>
              </div>
              <div className="metric-text" id={this.circlebox_class} >
                <p className={this.review_number_text_class} >{review.difficulty}</p>
              </div>
              <div className="metric-text" id={this.circlebox_class} >
                <p className={this.review_number_text_class} >{(review.workload) ? review.workload : "-"}</p>
            </div>
          </div>
          <div className="col rightCol">
            <div className="noLeftRightSpacing prof">
              <p className={this.professor_title_class}>Professor: </p>
                {/*The following adds a grey professor box for each professor listed in the review*/}
                {(review.professors && review.professors.length !== 0) ? review.professors.map((prof, index) => (<p className={this.professor_text_class} key={index}>
                  {prof}</p>)) : <div>
                    <p className={this.professor_text_class}>N/A</p></div>}
              </div>

              <div className="row noLeftRightSpacing review-padding-left">
                <div className={this.review_text_class} >
                    <ShowMoreText
                    lines={2}
                    more='Show more'
                    less='Show less'
                    anchorClass='review'
                    onClick={this.executeOnClick}
                    expanded={this.state.expanded}
                    width={615}
                >
                    {review.text}
                </ShowMoreText>
                </div>
                <p className="review-date"><i>{this.reviewToSemester(review)}</i></p>
                <button className= //if the review has been liked, the button will be filled in.
                  {(this.state.liked == false ? "upvote btn-lg" : "voted btn-lg")}
                  onClick={() => {
                    this.increment(review);
                  }}>
                  <span className="glyphicon glyphicon-thumbs-up"></span>
                  <p className="upvote-text">Helpful
                  ({(this.props.isPreview ? this.state.numLikes : ((review.likes == undefined) ? 0 : review.likes))})</p>
                </button>

              </div>

            </div>

          </div>
          
      </div>
    );
  }
}


// takes in the database object representing this review
Review.propTypes = {
  info: PropTypes.object.isRequired,
  reportHandler: PropTypes.func,
  sortHandler:PropTypes.func,
  isPreview: PropTypes.bool.isRequired,
  likes: PropTypes.number
};

import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import Review from './Review.jsx';

import RecentReview from './RecentReview';
import { Review as ReviewType } from 'common';
import './css/CourseReviews.css';

type Props = {
  courseId: string; reviews: readonly ReviewType[]; loading: boolean,
  onScroll?: any,
  transformGauges?: any
};
type State = { comparator: 'helpful'; reviews: any };

/*
  Course Reviews Component.

  Container component that takes in the course's database id and returns:
  If course Id is valid:
    a list of all reviews for a course, sorted by date.
    The component also handles user reporting of reviews.

  If course id = -1:
    - list of 5 most recent reviews added to the database
*/

export class CourseReviews extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { comparator: "helpful", reviews: [] };
  }

  componentDidMount() {
    axios.post(`/v2/getReviewsByCourseId`, { courseId: this.props.courseId }).then(response => {
      const reviews = response.data.result
      if (reviews) {
        this.setState({ reviews: this.renderReviews(reviews) });
        this.sort(this.state.comparator);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Unable to find reviews by course by id = ${this.props.courseId}`);
      }
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps !== this.props) {
      axios.post(`/v2/getReviewsByCourseId`, { courseId: this.props.courseId }).then(response => {
        const reviews = response.data.result
        if (reviews) {
          this.setState({ reviews: this.renderReviews(reviews) });
          this.sort(this.state.comparator);
        } else {
          // eslint-disable-next-line no-console
          console.log(`Unable to find reviews by course by id = ${this.props.courseId}`);
        }
      });
    }
  }


  // Handles selecting different sort bys
  handleSelect = (event: any) => {
    let opt = event.target.value;
    this.setState({ comparator: opt });
    this.sort(opt);
  }

  sort = (comp: 'helpful') => {
    let reviews = this.state.reviews;
    let data = [];
    if (comp === "helpful") data = reviews.sort((a: any, b: any) => {
      if (!b.props.info.likes) return -1;
      if (!a.props.info.likes) return 1;
      if (b.props.info && a.props.info) {
        if (a.props.info.likes > b.props.info.likes) {
          return -1;
        }
        if (a.props.info.likes < b.props.info.likes) {
          return 1;
        }
      }

      return 0;
    })
    else data = reviews.sort((a: any, b: any) => {
      if (!b.props.info.date) return 1;
      if (!a.props.info.date) return -1;
      if (b.props.info && a.props.info) {
        console.log(a.props.info.date + " " + a.props.info.date);
        if (a.props.info.date > b.props.info.date) {
          return -1;
        }
        if (a.props.info.date < b.props.info.date) {
          return 1;
        }
      }
      return 0;
    });

    this.setState({ reviews: data });
  };

  // Report this review. Find the review in the local database and change
  // its 'reported' flag to true.
  reportReview = (review: ReviewType) => {
    axios.post("/v2/reportReview", { id: review._id })
      .then((response) => {
        const result = response.data.result.resCode;
        if (result === 1) {
          let idx = 0;
          while (idx < this.state.reviews.length && this.state.reviews[idx].key !== review._id) {
            idx++;
          }
          this.setState({ reviews: this.state.reviews.slice(0, idx).concat(this.state.reviews.slice(idx + 1)) });
          console.log("Reported review #" + review._id);
        } else {
          console.log("Error reporting review!");
        }
      });
  };

  // Loop through the list of reivews and render them (as a list)
  renderReviews(reviews: readonly ReviewType[]) {
    const reviewCompList: any[] = [];
    if (this.props.courseId === "-1") {
      reviews.forEach((review) => (
        reviewCompList.push(<RecentReview key={review._id} info={review} reportHandler={this.reportReview} />)
      ));
    } else {
      reviews.forEach((review) => (
        reviewCompList.push(<Review key={review._id} info={review} reportHandler={this.reportReview} isPreview={false} pending={false}/>)
      ));
      return reviewCompList;
    }
  }

  sort_reviews = () => {
    if (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) > 992) {
      return (
        <div className="coursereviews-sort-container">
          <div className="coursereviews-sort"> Sort By:
              <select onChange={this.handleSelect} className="coursereviews-sort-options">
              <option value="helpful">Most Helpful</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>
      )
    }
  }

  render() {
    let title = "Past Reviews (" + this.state.reviews.length + ")";
    if (this.props.courseId === "-1") {
      title = "Recent Reviews";
    }
    return (

      <div>
        <div className={"" + (this.props.transformGauges ? "hidden" : "coursereviews-header")}>
          <div className="coursereviews-past-reviews-text">
            {title}
          </div>
          {this.sort_reviews()}
        </div>
        <div>
          {
            this.props.onScroll !== undefined &&
            <ul onScroll={(e) => this.props.onScroll(e)} className="coursereviews-review-ul">
              {this.state.reviews}
            </ul>
          }
          {
            this.props.onScroll === undefined &&
            <ul className="coursereviews-review-ul">
              {this.state.reviews}
            </ul>
          }
        </div>
      </div>
    );
  }
}



// wrap in a container class that allows the component to dynamically grab data
// the component will automatically re-render when databse data changes!
export default ({ courseId, onScroll, transformGauges }: { readonly courseId: string, onScroll: any, transformGauges: any }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<readonly ReviewType[]>([]);

  useEffect(() => {
    axios.post(`/v2/getReviewsByCourseId`, { courseId: courseId }).then(response => {
      const reviews = response.data.result
      if (reviews) {
        setReviews(reviews);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Unable to find reviews by course by id = ${courseId}`);
      }
      setLoading(false);
    });
  }, [courseId]);

  return <CourseReviews courseId={courseId} reviews={reviews} loading={loading} onScroll={onScroll} transformGauges={transformGauges} />;
};

import React, { Component } from 'react';
import PreviewCard from './PreviewCard';
import CourseReviews from './CourseReviews';
import Form from './Form.jsx';
import { Link } from 'react-router-dom';
import { Session } from '../session-store';

interface Props {
  onClickText: () => void;
  card_course: any;
  transformGauges: boolean;
  scrollReviews: () => void;
  classView: boolean;
  showMobileReviewForm: boolean;
  setShowMobileReviewForm: () => void
}




interface State {
  showMobileReviewForm: boolean;
};

export default class ResultsDisplayMobile extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    // set gauge values
    this.state = {
      showMobileReviewForm: false
    };

    this.setShowMobileReviewForm = this.setShowMobileReviewForm.bind(this);
  }
  setShowMobileReviewForm() {
    this.setState({ showMobileReviewForm: (!this.state.showMobileReviewForm) })
  }

  render() {
    const last = Session.get("last-search");

    return (
      <div className="fullscreen">
        <div>
          <div className="mobile-search-gradient">
            {
              !this.props.classView &&
              <div className="search-results-text" onClick={this.props.onClickText}>
                {"< "} Search Results
              </div>
            }
            {
              this.props.classView &&
              <div className="search-results-text">
                <Link to={last ? `/results/keyword/${last.split(" ").join("+")}` : "/"} style={{ textDecoration: 'none', color: '#0076FF' }}>{"< "} Search Results</Link>
              </div>
            }

            <PreviewCard course={this.props.card_course} mobile={true} transformGauges={this.props.transformGauges} />
          </div>

          <CourseReviews courseId={this.props.card_course._id} onScroll={this.props.scrollReviews} transformGauges={this.props.transformGauges} />
          <div className={"button-position-search-results " + (this.props.transformGauges ? "" : ".d-none.d-lg-block")}>
            <button type="submit" className="btn btn-primary review-bottom-button" onClick={this.setShowMobileReviewForm}>Leave A Review</button>
          </div>
          {this.state.showMobileReviewForm && <Form course={this.props.card_course} inUse={true} state={this.state} props={this.props} setShowMobileReviewForm={this.setShowMobileReviewForm} />}
        </div>
      </div>
    )
  }

}

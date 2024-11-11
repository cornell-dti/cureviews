import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ReviewCard from './ReviewCard';
import PreviewReviewCard from './PreviewReviewCard';
import { Review } from 'common';

type CourseReviewsProps = {
  reviews: readonly Review[];
  isPreview: boolean;
  isProfile: boolean;
  token?: string | null;
};

const CourseReviews = ({
  reviews,
  isPreview,
  isProfile,
  token
}: CourseReviewsProps) => {
  const [visibleReviews, setVisibleReviews] = useState(reviews);

  useEffect(() => {
    setVisibleReviews(reviews)
  }, [reviews])

  /**
   * Attempts to report review, and filters out the reported review locally
   * @param reviewId: _id of review to report
   */
  async function reportReview(reviewId: string) {
    const response = await axios.post('/api/reviews/report', {
      token: token,
      id: reviewId
    });
    if (response.status === 200) {
      const updated = reviews.filter((rev) => rev._id !== reviewId);
      setVisibleReviews(updated);
      toast.success(
        "Thank you. We'll check if this review meets our guidelines."
      );
    } else {
      toast.error('An error occurred. Please try again.');
    }
  }

  // isPreview and isProfile => PENDING review
  // !isPreview and isProfile => PROFILE regular review

  /* PENDING REVIEWS */
  if (isPreview && isProfile) {
    return (
      <div data-cy={`course-reviews`}>
        {visibleReviews.map((review) => (
          <PreviewReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
          />
        ))}
      </div>
    );
  } else if (!isPreview && isProfile) {
    /* PROFILE PAST REVIEWS PREVIEWS */
    return (
      <div data-cy={`course-reviews`}>
        {visibleReviews.map((review) => (
          <PreviewReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
          />
        ))}
      </div>
    );
  } else if (isPreview && !isProfile) {
    /* SEARCH RESULTS */
    return (
      <div data-cy={`course-reviews`}>
        {visibleReviews.map((review) => (
          <PreviewReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
          />
        ))}
      </div>
    );
  } else
    return (
      <div data-cy={`course-reviews`}>
        {visibleReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
            reportHandler={reportReview}
          />
        ))}
      </div>
    );
};

export default CourseReviews;

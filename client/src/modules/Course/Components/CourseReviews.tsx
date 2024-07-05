import React from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import ReviewCard from './ReviewCard'
import PreviewReviewCard from './PreviewReviewCard'
import { Review } from 'common'

type CourseReviewsProps = {
  reviews: readonly Review[]
  isPreview: boolean
  isProfile: boolean
}

const CourseReviews = ({
  reviews,
  isPreview,
  isProfile,
}: CourseReviewsProps) => {

  /**
   * Attempts to report review, and filters out the reported review locally
   * @param reviewId: id of review to report
   */
    async function reportReview(reviewId: string) {
      const response = await axios.post('/api/reviews/report', { id: reviewId })
      if (response.status === 200) {
        reviews = reviews.filter((rev) => rev._id !== reviewId);
        toast.success("Thank you, we'll check if this review meets our guidelines."
        )
      } else {
        toast.error('An error occurred. Please try again.')
      }
    }

  // isPreview and isProfile => PENDING review
  // !isPreview and isProfile => PROFILE regular review

  /* PENDING REVIEWS */
  if (isPreview && isProfile) {
    return (
      <div data-cy={`course-reviews`}>
        {reviews.map((review) => (
          <PreviewReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
          />
        ))}
      </div>
    )
  } else if (!isPreview && isProfile) {
    /* PROFILE PAST REVIEWS PREVIEWS */
    return (
      <div data-cy={`course-reviews`}>
        {reviews.map((review) => (
          <PreviewReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
          />
        ))}
      </div>
    )
  } else if (isPreview && !isProfile) {
    /* SEARCH RESULTS */
    return (
      <div data-cy={`course-reviews`}>
        {reviews.map((review) => (
          <PreviewReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
          />
        ))}
      </div>
    )
  } else
    return (
      <div data-cy={`course-reviews`}>
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            isPreview={isPreview}
            isProfile={isProfile}
            reportHandler={reportReview}
          />
        ))}
      </div>
    )
}

export default CourseReviews

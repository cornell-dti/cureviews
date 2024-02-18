import React from 'react'
import ReviewCard from './ReviewCard'
import PreviewReviewCard from './PreviewReviewCard'
import { Review } from 'common'

type CourseReviewsProps = {
  reviews: readonly Review[]
  onReportReview?: (id: string) => void
  isPreview: boolean
  isProfile: boolean
}

const CourseReviews = ({
  reviews,
  onReportReview,
  isPreview,
  isProfile,
}: CourseReviewsProps) => {
  function reportReview(review: Review) {
    onReportReview?.(review._id)
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

import React from 'react'
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
          />
        ))}
      </div>
    )
}

export default CourseReviews

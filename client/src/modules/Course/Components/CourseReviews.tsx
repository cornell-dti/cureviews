import React from 'react'
import ReviewCard from './ReviewCard'
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

  return (
    <div>
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

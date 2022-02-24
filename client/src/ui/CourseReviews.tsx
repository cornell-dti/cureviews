import React from "react";
import ReviewCard from "./ReviewNew";
import { Review } from "common";

type CourseReviewsProps = {
  reviews: readonly Review[];
  onReportReview?: (id: string) => void;
};

export default function CourseReviews({
  reviews,
  onReportReview,
}: CourseReviewsProps) {
  function reportReview(review: Review) {
    onReportReview?.(review._id);
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard
          reviewId={review._id}
          review={review}
          reportHandler={reportReview}
          isPreview={false}
        />
      ))}
    </div>
  );
}

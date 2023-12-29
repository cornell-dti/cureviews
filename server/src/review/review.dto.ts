import { Review } from './review';

export interface InsertReviewDTO {
  token: string;
  courseId: string;
  review: Review;
}

export interface ReviewLikesDTO {
  token: string;
  id: string;
}

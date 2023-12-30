import { Review } from '../review/review';

export interface AdminReviewRequestDTO {
  token: string;
  review: Review;
}

export interface AdminRequestDTO {
  token: string;
}

export interface RaffleWinnerDTO {
  startDate: string;
}

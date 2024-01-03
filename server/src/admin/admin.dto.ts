import { Review } from '../review/review';

export interface AdminReviewRequestDTO {
  token: string;
  review: AdminReviewDTO;
}

interface AdminReviewDTO {
  _id: string;
}

export interface AdminRequestDTO {
  token: string;
}

export interface RaffleWinnerDTO {
  startDate: string;
}

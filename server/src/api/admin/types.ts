import { ReviewDocument } from "../../../db/dbDefs";

export interface Token {
  token: string;
}

export interface GetReviewsOverTimeTop15Request {
  token: string;
  step: number;
  range: number;
}

// The type for a request with an admin action for a review
export interface AdminReviewRequest {
  review: ReviewDocument;
  token: string;
}

// The type for a request with an admin action for updating professors info
export interface AdminProfessorsRequest {
  token: string;
}

export interface AdminRaffleWinnerRequest {
  token: string;
  startDate: string;
}

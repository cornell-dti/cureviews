import { Auth } from '../auth/auth';

export interface AdminReviewRequestType {
  token: string;
  review: AdminReviewType;
}

interface AdminReviewType {
  _id: string;
}

export interface AdminRequestType {
  token: string;
}

export interface RaffleWinnerRequestType {
  startDate: string;
}

export interface AdminReviewVisibilityType {
  reviewId: string;
  auth: Auth;
  visibility: number;
  reported: number;
}

export interface AdminPendingReviewType {
  reviewId: string;
  auth: Auth;
}

export interface AdminAddSemesterRequestType {
  token: string;
  semester: string;
}

export interface AdminAddSemesterType {
  auth: Auth;
  semester: string;
}

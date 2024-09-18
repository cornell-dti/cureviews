import { Auth } from '../auth/auth';

export interface UpdateCourseMetrics {
  rating: number | null;
  workload: number | null;
  diff: number | null;
}

export interface ReportReviewRequestType {
  id: string;
}

export interface AdminReviewRequestType {
  token: string;
  review: AdminReviewType;
}

export interface AdminUserRequestType {
  token: string;
  userId: string;
}

interface AdminReviewType {
  _id: string;
  reported: number;
}

export interface AdminRequestType {
  token: string;
}

export interface VerifyAdminType {
  auth: Auth;
}

export interface VerifyManageAdminType {
  auth: Auth;
  id: string;
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

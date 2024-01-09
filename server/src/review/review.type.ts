import { Auth } from '../auth/auth';

export interface InsertReviewRequestType {
  token: string;
  courseId: string;
  review: ReviewRequestType;
}

interface ReviewRequestType {
  rating: number;
  difficulty: number;
  workload: number;
  professors: string[];
  text: string;
  isCovid: boolean;
  grade: string;
  major: string[];
}

export interface ReviewLikesRequestType {
  token: string;
  id: string;
}

export interface InsertReviewType {
  auth: Auth;
  courseId: string;
  review: ReviewRequestType;
}

export interface ReviewLikesType {
  auth: Auth;
  reviewId: string;
}

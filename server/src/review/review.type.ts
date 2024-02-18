import { StudentDocument } from '../db/schema.js';
import { Auth } from '../auth/auth.js';

export interface VerifyStudentType {
  netId: string;
  student: StudentDocument;
}
export interface VerifyAuthType {
  auth: Auth;
}

export interface AddStudentReviewType {
  reviewId: string;
  netId: string;
}

export interface SetStudentLikedReviewsType {
  netId: string;
  reviewId: string;
  liked: boolean;
}

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

export interface InsertReviewType {
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

export interface ReviewLikesType {
  token: string;
  id: string;
}

export interface ReportReviewType {
  id: string;
}

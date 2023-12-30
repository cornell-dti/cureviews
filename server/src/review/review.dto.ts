export interface InsertReviewDTO {
  token: string;
  courseId: string;
  review: ReviewRequestDTO;
}

interface ReviewRequestDTO {
  rating: number;
  difficulty: number;
  workload: number;
  professors: string[];
  text: string;
  isCovid: boolean;
  grade: string;
  major: string[];
}

export interface ReviewLikesDTO {
  token: string;
  id: string;
}

export interface ReportReviewDTO {
  id: string;
}

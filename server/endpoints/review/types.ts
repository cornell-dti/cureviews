import { Review } from "common";

// The type of a query with a courseId
export interface CourseIdQuery {
  courseId: string;
}

export interface InsertReviewRequest {
  token: string;
  review: Review;
  classId: string;
}

export interface InsertUserRequest {
  // TODO: one day, there may be types for this object. Today is not that day.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  googleObject: any;
}

// The type of a query with a course number and subject
export interface ClassByInfoQuery {
  subject: string;
  number: string;
}

export interface ReviewRequest {
  id: string;
  token: string;
}

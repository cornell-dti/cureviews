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

export interface RaffleWinnerType {
  startDate: string;
}

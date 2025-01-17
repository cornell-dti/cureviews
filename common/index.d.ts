/** Expose types of database objects that are shared between frontend and backend. */

export interface Class {
  readonly _id: string;
  classSub: string;
  classNum: string;
  classTitle?: string;
  classDescription?: string;
  classPrereq: string[];
  crossList: string[];
  classFull?: string;
  classSems?: string[];
  classProfessors?: string[];
  classRating?: number;
  classWorkload?: number;
  classDifficulty?: number;
  classSummary?: string;
  summaryTags?: Map<string, [string, string]>;
  summaryFreshness?: number;
  recommendations: Recommendation[];
}

export interface Student {
  readonly _id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly netId: string;
  readonly affiliation: string;
  readonly token: string;
  readonly privilege: string; // user privilege level
  reviews: string[];
  likedReviews: string[];
  majors?: string[];
}

export interface Subject {
  readonly _id: string;
  readonly subShort: string;
  readonly subFull: string;
}

export interface Review {
  readonly _id: string;
  user: string;
  text: string;
  difficulty?: number;
  rating?: number;
  workload?: number;
  class?: string;
  date?: Date;
  visible?: number;
  reported?: number;
  professors?: string[];
  likes?: number;
  likedBy: string[];
  isCovid?: boolean;
  grade?: string;
  major?: string[];
}

export interface Professor {
  readonly _id: string;
  readonly fullName: string;
  readonly courses: string[];
  readonly major: string;
}

interface Recommendation {
  readonly _id: string;
  className: string;
  classSub: string;
  classNum: string;
  tags: string[];
  similarityScore: number;
}
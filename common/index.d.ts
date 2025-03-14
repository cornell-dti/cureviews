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

/** Processed course evaluation data for a single course. */
interface CourseEvaluation {
  _id: string;
  courseName: string;
  subject: string; // derived from courseName -- should be type Subject eventually
  courseNumber: string; // derived from courseName
  semester: string;
  totalEvals: number; // derived by summing over grade levels
  courseOverall: number;
  profTeachingSkill: number;
  profKnowledge: number;
  profClimate: number;
  profOverall: number;
  numA: number;
  numB: number;
  numC: number;
  numD: number;
  numF: number;
  numS: number;
  numU: number;
  numGradeNA: number;
  numFresh: number;
  numSoph: number;
  numJr: number;
  numSr: number;
  numAg: number;
  numHumec: number;
  numArch: number;
  numILR: number;
  numArts: number;
  numEng: number;
  numHotel: number;
  numOther: number;
  numMajorReq: number;
  numReputation: number;
  numInterest: number;
  sentiments: [number, number][];
}
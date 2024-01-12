import { TokenPayload } from "google-auth-library";
import { Auth } from "./auth";
import { StudentDocument } from "../../db/schema";

export interface TokenPayloadType {
  token: TokenPayload;
}

export interface VerifyAuthType {
  auth: Auth;
}

export interface AuthRequestType {
  token: string;
}

export interface VerifyStudentType {
  netId: string;
  student: StudentDocument;
}

export interface InsertStudentType {
  _id: string;
  firstName: string;
  lastName: string;
  netId: string;
  affiliation: string;
  token: string;
  privilege: string;
}

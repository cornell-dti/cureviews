import { TokenPayload } from 'google-auth-library';
import { Auth } from './auth';

export interface GetUserType {
  token: TokenPayload;
}

export interface VerifyAuthType {
  auth: Auth;
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

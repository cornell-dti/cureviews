import { TokenPayload } from 'google-auth-library';
import { Auth } from './auth';
import { StudentDocument } from '../../db/schema';

export interface GetUserType {
  token: TokenPayload;
}

export interface VerifyAuthType {
  auth: Auth;
}

export interface ProfileInfoType {
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

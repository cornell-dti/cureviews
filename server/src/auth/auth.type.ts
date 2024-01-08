import { TokenPayload } from 'google-auth-library';

export interface GetUserType {
  token: TokenPayload;
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

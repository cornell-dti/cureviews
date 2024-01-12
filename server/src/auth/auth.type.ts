import { TokenPayload } from 'google-auth-library';

export interface TokenPayloadType {
  token: TokenPayload;
}

export interface AuthRequestType {
  token: string;
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

import { TokenPayload } from 'google-auth-library';

export interface InsertUserDTO {
  token: TokenPayload;
}

export interface InsertStudentDTO {
  _id: string;
  firstName: string;
  lastName: string;
  netId: string;
  affiliation: string;
  token: string;
  privilege: string;
}

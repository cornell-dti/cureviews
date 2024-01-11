import { TokenPayload } from 'google-auth-library';

export const validTokenPayload: TokenPayload = {
  email: 'dti1@cornell.edu',
  iss: '',
  sub: '',
  iat: 1,
  aud: '',
  exp: 0,
  hd: 'cornell.edu',
};

export const invalidTokenPayload: TokenPayload = {
  email: 'cv4620@cornell.edu',
  iss: '',
  sub: '',
  iat: 0,
  aud: '',
  exp: 0,
};

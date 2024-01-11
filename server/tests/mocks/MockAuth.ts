import { TokenPayload } from 'google-auth-library';
import { Auth } from '../../src/auth/auth';

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

export const mockVerificationTicket = jest
  .spyOn(Auth.prototype, 'getVerificationTicket')
  .mockImplementation(async () => {
    if (Auth.prototype.getToken() === 'fakeTokenDti1') {
      return validTokenPayload;
    }
    return invalidTokenPayload;
  });

export const getValidTokenMock = jest
  .spyOn(Auth.prototype, 'getToken')
  .mockImplementation(() => {
    return 'fakeTokenDti1';
  });

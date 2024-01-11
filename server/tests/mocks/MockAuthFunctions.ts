import { Auth } from '../../src/auth/auth';
import { validTokenPayload, invalidTokenPayload } from '../mocks/MockAuth';

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

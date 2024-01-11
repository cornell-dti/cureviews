import axios from 'axios';

import { testPort, testServer } from './mocks/MockServer';
import { testStudents } from './mocks/InitMockDb';
import { Students } from '../db/schema';
import { mockVerificationTicket } from './mocks/MockAuth';
import { Auth } from '../src/auth/auth';

beforeAll(async () => {
  await testServer.setUpDB(
    undefined,
    testStudents,
    undefined,
    undefined,
    undefined,
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
  await mockVerificationTicket.mockRestore();
});

describe('auth functionality works', () => {
  it('insertUser', async () => {
    const getInvalidTokenMock = jest
      .spyOn(Auth.prototype, 'getToken')
      .mockImplementation(() => {
        return 'fakeTokencv4620';
      });

    const user1 = {
      _id: 'Irrelevant',
      firstName: 'Cornellius',
      lastName: 'Vanderbilt',
      netId: 'cv4620',
      affiliation: null,
      token: 'fakeTokencv4620',
      privilege: 'regular',
    };

    const res = await axios.post(
      `http://localhost:${testPort}/api/insertUser`,
      { token: user1.token },
    );
    expect(res.status).toBe(200);
    expect(
      (await Students.find({}).exec()).filter((s) => s.netId === 'cv4620')
        .length,
    ).toBe(1);

    getInvalidTokenMock.mockRestore();
  });

  it('tokenIsAdmin-works', async () => {
    const failRes = await axios.post(
      `http://localhost:${testPort}/api/tokenIsAdmin`,
      { token: 'fakeTokencv4620' },
    );

    expect(failRes.data.result).toEqual(false);

    const getValidTokenMock = jest
      .spyOn(Auth.prototype, 'getToken')
      .mockImplementation(() => {
        return 'fakeTokenDti1';
      });

    const successRes = await axios.post(
      `http://localhost:${testPort}/api/tokenIsAdmin`,
      { token: 'fakeTokenDti1' },
    );

    expect(successRes.data.result).toEqual(true);
    await getValidTokenMock.mockRestore();
  });
});

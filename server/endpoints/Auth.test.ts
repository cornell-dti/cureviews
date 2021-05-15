import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";
import axios from 'axios';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';

import { configure } from "../endpoints";
import { Students } from "../dbDefs";
import * as Auth from "./Auth";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 37761;


const invalidTokenPayload: TokenPayload = {
  email: 'cv4620@cornell.edu',
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
};

const validTokenPayload: TokenPayload = {
  email: 'dti1@cornell.edu',
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
};

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  const nonAdminUser = new Students({
    _id: "Irrelevant",
    firstName: "Cornellius",
    lastName: "Vanderbilt",
    netId: "cv4620",
    affiliation: null,
    token: "fakeTokencv4620",
    privilege: "regular",
  });

  const adminUser = new Students({
    _id: "Irrelevant2",
    firstName: "Dan Thomas",
    lastName: "Ivy",
    netId: "dti1",
    affiliation: null,
    token: "fakeTokenDti1",
    privilege: "admin",
  });

  await nonAdminUser.save();
  await adminUser.save();

  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  serverCloseHandle = app.listen(testingPort);
  configure(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  serverCloseHandle.close();
});

describe('tests', () => {
  it('tokenIsAdmin-works', async () => {
    const mockVerificationTicket = jest.spyOn(Auth, 'getVerificationTicket').mockImplementation(async (token?: string) => {
      if (token === 'fakeTokenDti1') {
        return validTokenPayload;
      }
      return invalidTokenPayload;
    });

    const failRes = await axios.post(`http://localhost:${testingPort}/v2/tokenIsAdmin`, { token: "fakeTokencv4620" });
    expect(failRes.data.result).toEqual(false);
    const successRes = await axios.post(`http://localhost:${testingPort}/v2/tokenIsAdmin`, { token: "fakeTokenDti1" });
    expect(successRes.data.result).toEqual(true);

    mockVerificationTicket.mockRestore();
  });
});

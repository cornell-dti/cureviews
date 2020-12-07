import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { TokenPayload } from 'google-auth-library';

import { Review } from 'common';
import { configure } from "../endpoints";
import { Classes, Reviews, Students } from "../dbDefs";
import * as Auth from "./Auth";
import { testClasses, testReviews } from './Review.test';

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 8090;

const validTokenPayload: TokenPayload = {
  email: 'dti1@cornell.edu',
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
  hd: "cornell.edu",
};

const testUsers = [
  {
    _id: "Irrelevant2",
    firstName: "Dan Thomas",
    lastName: "Ivy",
    netId: "dti1",
    affiliation: null,
    token: "fakeTokenDti1",
    privilege: "admin",
  },
];

const mockVerificationTicket = jest.spyOn(Auth, 'getVerificationTicket')
  .mockImplementation(async (token: string) => validTokenPayload);

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  await Promise.all(
    testClasses.map(async (c) => await (new Classes(c).save())),
  );

  await Promise.all(
    testReviews.map(async (r) => await (new Reviews(r).save())),
  );

  await Promise.all(
    testUsers.map(async (u) => await (new Students(u).save())),
  );

  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  serverCloseHandle = app.listen(testingPort, async () => { });
  configure(app);
});

afterAll(async () => {
  await mockVerificationTicket.mockRestore();
  await mongoose.disconnect();
  await mongoServer.stop();
  await serverCloseHandle.close();
});

describe('tests', () => {
  it('totalReviews', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/totalReviews`, { token: "token" });
    expect(res.data.result).toBe(testReviews.length);
  });
});

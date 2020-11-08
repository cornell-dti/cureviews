import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { configure } from "../endpoints";
import { Students } from "../dbDefs";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 37760;

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
    token: "fakeTokendti1",
    privilege: "admin",
  });

  await nonAdminUser.save();
  await adminUser.save();

  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  serverCloseHandle = app.listen(testingPort, async () => {});
  configure(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  serverCloseHandle.close();
});

describe('tests', () => {
  it('tokenIsAdmin-works', async () => {
    const failRes = await axios.post(`http://localhost:${testingPort}/v2/tokenIsAdmin`, { token: "fakeTokencv4620" });
    expect(failRes.data.result).toEqual(false);
    const successRes = await axios.post(`http://localhost:${testingPort}/v2/tokenIsAdmin`, { token: "fakeTokendti1" });
    expect(successRes.data.result).toEqual(true);
  });
});

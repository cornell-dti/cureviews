import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { configure } from "../endpoints";
import { Classes, Students, Subjects } from "../dbDefs";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 37760;

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  serverCloseHandle = app.listen(testingPort, async () => { });
  configure(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  serverCloseHandle.close();
});

describe('tests', () => {
  it('getClassesByQuery-works', async () => {

  });
});

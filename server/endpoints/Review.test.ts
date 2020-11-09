import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { Review } from 'common';
import { configure } from "../endpoints";
import { Classes, Students, Subjects, Reviews } from "../dbDefs";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 37760;

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  const c2110 = new Classes({
    _id: "oH37S3mJ4eAsktypy",
    classSub: "cs",
    classNum: "2110",
    classTitle: "Object-Oriented Programming and Data Structures",
    classPrereq: [],
    classFull: "cs 2110 object-oriented programming and data structures",
    classSems: ["FA14", "SP15", "SU15", "FA15", "SP16", "SU16", "FA16", "SP17",
      "SU17", "FA17", "SP18", "FA18", "SU18", "SP19", "FA19", "SU19"],
    crossList: ["q75SxmqkTFEfaJwZ3"],
    classProfessors: ["David Gries", "Douglas James", "Siddhartha Chaudhuri",
      "Graeme Bailey", "John Foster", "Ross Tate", "Michael George",
      "Eleanor Birrell", "Adrian Sampson", "Natacha Crooks", "Anne Bracy",
      "Michael Clarkson"],
    classDifficulty: 2.9,
    classRating: null,
    classWorkload: 3,
  });

  const review1 = new Reviews({
    _id: "4Y8k7DnX3PLNdwRPr",
    text: "review text for cs 2110",
    difficulty: 1,
    quality: 4,
    class: "oH37S3mJ4eAsktypy",
    grade: 6,
    date: new Date().toISOString(),
    atten: 0,
    visible: 1,
    reported: 0,
  });

  const review2 = new Reviews({
    _id: "4Y8k7DnX3PLNdwRPq",
    text: "review text for cs 2110 number 2",
    difficulty: 1,
    quality: 5,
    class: "oH37S3mJ4eAsktypy",
    grade: 6,
    date: new Date().toISOString(),
    atten: 0,
    visible: 1,
    reported: 0,
  });

  await review2.save();
  await review1.save();
  await c2110.save();
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
    const res = await axios.post(`http://localhost:${testingPort}/v2/getReviewsByCourseId`, { courseId: "oH37S3mJ4eAsktypy" });
    expect(res.data.result.length).toBe(2);
  });
});

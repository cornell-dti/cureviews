import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";
import axios from 'axios';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';

import { configure } from "../endpoints";
import { Classes, Reviews } from "../dbDefs";
import * as Auth from "./Auth";
import { undoReportReview } from './AdminActions';

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 37760;

const sampleReviewId = "sample-review";
const reviewToUndoReportId = "review-to-undo-report";

const newCourse1 = new Classes({
  _id: "newCourse1",
  classSub: "MORK",
  classNum: "1110",
  classTitle: "Introduction to Testing",
  classFull: "MORK 1110: Introduction to Testing",
  classSems: ["FA19"],
  classProfessors: ["Gazghul Thraka"],
  classRating: 0,
  classWorkload: 0,
  classDifficulty: 0,
});

const sampleReview = new Reviews({
  _id: sampleReviewId,
  visible: 0,
  class: newCourse1._id,
  difficulty: 1,
  rating: 1,
  workload: 1,
});

const reviewToUndoReport = new Reviews({
  _id: reviewToUndoReportId,
  reported: 1,
  visible: 1,
  class: newCourse1._id,
  difficulty: 5,
  rating: 5,
  workload: 5,
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

  await newCourse1.save();
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
  it('makeReviewVisible-works', async () => {
    const mockVerificationTicket = jest.spyOn(Auth, 'getVerificationTicket').mockImplementation(async (token? : string) => validTokenPayload);
    await sampleReview.save();
    const res = await axios.post(`http://localhost:${testingPort}/v2/makeReviewVisible`, { review: sampleReview, token: "non-empty" });
    expect(res.data.result).toEqual(1);
    const course = await Classes.findById("newCourse1");
    expect(course.classDifficulty).toEqual(sampleReview.difficulty);
    expect(course.classWorkload).toEqual(sampleReview.workload);
    expect(course.classRating).toEqual(sampleReview.rating);

    mockVerificationTicket.mockRestore();
  });

  it('undoReportReview-works', async () => {
    const mockVerificationTicket = jest.spyOn(Auth, 'getVerificationTicket').mockImplementation(async (token? : string) => validTokenPayload);
    await reviewToUndoReport.save();
    const res = await axios.post(`http://localhost:${testingPort}/v2/undoReportReview`, { review: reviewToUndoReport, token: "non-empty" });
    expect(res.data.result).toEqual(1);
    const course = await Classes.findById("newCourse1");
    expect(course.classDifficulty).toEqual(reviewToUndoReport.difficulty);
    expect(course.classWorkload).toEqual(reviewToUndoReport.workload);
    expect(course.classRating).toEqual(reviewToUndoReport.rating);

    mockVerificationTicket.mockRestore();
  });

  it('removeReview-works', async () => {
    const mockVerificationTicket = jest.spyOn(Auth, 'getVerificationTicket').mockImplementation(async (token? : string) => validTokenPayload);
    await sampleReview.save();
    const res = await axios.post(`http://localhost:${testingPort}/v2/removeReview`, { review: sampleReview, token: "non-empty" });
    expect(res.data.result).toEqual(1);
    const course = await Classes.findById("newCourse1");
    expect(course.classDifficulty).toEqual("-");
    expect(course.classWorkload).toEqual("-");
    expect(course.classRating).toEqual("-");

    mockVerificationTicket.mockRestore();
  });
});

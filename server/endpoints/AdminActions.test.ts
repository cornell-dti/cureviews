import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import axios from "axios";

import { configure } from "../endpoints";
import { Classes, Reviews, Students } from "../dbDefs";
import * as Utils from "./utils";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;
const mockVerification = jest
  .spyOn(Utils, "verifyToken")
  .mockImplementation(async (token?: string) => true);

const testingPort = 47728;

const sampleReviewId = "sampleReview";
const reviewToUndoReportId = "reviewToUndoReport";

const newCourse1 = new Classes({
  _id: "fakeCourseId",
  classSub: "COOL",
  classNum: "1337",
  classTitle: "Beach Engineering",
  classFull: "COOL 1337: Beach Engineering",
  classSems: ["FA19"],
  classProfessors: ["Paul George"],
  classRating: 1,
  classWorkload: 1,
  classDifficulty: 1,
});

const sampleReview = new Reviews({
  _id: sampleReviewId,
  visible: 0,
  reported: 0,
  class: newCourse1._id,
  difficulty: 1,
  rating: 1,
  workload: 1,
});

const reviewToUndoReport = new Reviews({
  _id: reviewToUndoReportId,
  reported: 1,
  visible: 0,
  class: newCourse1._id,
  difficulty: 5,
  rating: 5,
  workload: 5,
});

const testStudent = new Students({
  _id: "Irrelevant",
  firstName: "Cornellius",
  lastName: "Vanderbilt",
  netId: "cv4620",
  affiliation: null,
  token: "fakeTokencv4620",
  privilege: "regular",
  reviews: ["4Y8k7DnX3PLNdwRPr", "4Y8k7DnX3PLNdwRPq", "3yMwTbiyd4MZLPQJF"],
  likedReviews: [],
  lastReported: new Date(),
  numReported: 0,
});

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  serverCloseHandle = app.listen(testingPort);
  configure(app);

  await reviewToUndoReport.save();
  await sampleReview.save();
  await newCourse1.save();
  await testStudent.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  serverCloseHandle.close();
  mockVerification.mockRestore();
});

describe("tests", () => {
  it("limiting reportReview", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/reportReview`,
      { id: sampleReview._id, netId: testStudent.netId },
    );
    expect(res.data.result.resCode).toEqual(1);
  });

  it("fetchReviewableClasses-works", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/fetchReviewableClasses`,
      { token: "non-empty" },
    );
    const ids = res.data.result.map((e) => e._id);
    expect(ids.includes(reviewToUndoReportId)).toBeTruthy();
    expect(ids.includes(sampleReviewId)).toBeTruthy();
  });

  it("makeReviewVisible-works", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/makeReviewVisible`,
      { review: sampleReview, token: "non-empty" },
    );
    expect(res.data.result.resCode).toEqual(1);
    const course = await Classes.findOne({ _id: newCourse1._id }).exec();
    console.log(course);
    // expect(course.classDifficulty).toEqual(sampleReview.difficulty);
    // expect(course.classWorkload).toEqual(sampleReview.workload);
    // expect(course.classRating).toEqual(sampleReview.rating);
  });

  it("undoReportReview-works", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/undoReportReview`,
      { review: reviewToUndoReport, token: "non empty" },
    );
    expect(res.data.result.resCode).toEqual(1);
    const reviewFromDb = await Reviews.findById(reviewToUndoReport._id).exec();
    expect(reviewFromDb.visible).toEqual(1);
    await reviewToUndoReport.remove();
  });

  it("removeReview-works", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/removeReview`,
      { review: sampleReview, token: "non-empty" },
    );
    expect(res.data.result.resCode).toEqual(1);
    const course = await Classes.findById(newCourse1._id);
    expect(course.classDifficulty).toEqual(null);
    expect(course.classWorkload).toEqual(null);
    expect(course.classRating).toEqual(null);
  });
});

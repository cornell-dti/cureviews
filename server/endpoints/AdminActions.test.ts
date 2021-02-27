import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";
import axios from 'axios';

import { configure } from "../endpoints";
import { Classes, Reviews } from "../dbDefs";
import * as Utils from "./utils";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;
const mockVerification = jest.spyOn(Utils, 'verifyToken').mockImplementation(async (token?: string) => true);

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
  classRating: 0,
  classWorkload: 0,
  classDifficulty: 0,
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

const newCourse2 = new Classes({
  _id: "fakeCourseId2",
  classSub: "COOL",
  classNum: "1347",
  classTitle: "Beach Engineering for Engineers",
  classFull: "COOL 1347: Beach Engineering for Engineers",
  classSems: ["FA19"],
  classProfessors: ["Paul George's Evil Twin"],
  classRating: 0,
  classWorkload: 0,
  classDifficulty: 0,
});

const sampleReview2 = new Reviews({
  _id: "angband",
  visible: 1,
  reported: 0,
  class: newCourse2._id,
  difficulty: 2,
  rating: 1,
  workload: 3,
});

const newCourse3 = new Classes({
  _id: "fakeCourseId3",
  classSub: "COOL",
  classNum: "2347",
  classTitle: "Beach Engineering for Engineers II",
  classFull: "COOL 2347: Beach Engineering for Engineers II",
  classSems: ["FA19"],
  classProfessors: ["Paul George's Evil Twin"],
  classRating: 0,
  classWorkload: 0,
  classDifficulty: 0,
});

const sampleReview3 = new Reviews({
  _id: "utomno",
  visible: 1,
  reported: 0,
  class: newCourse3._id,
  difficulty: 2,
  rating: 1,
  workload: 3,
});

const sampleReview4 = new Reviews({
  _id: "barad-dur",
  visible: 1,
  reported: 0,
  class: newCourse3._id,
  difficulty: 4,
  rating: 3,
  workload: 5,
});

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  await sampleReview.save();
  await newCourse1.save();
  await reviewToUndoReport.save();
  await newCourse2.save();
  await sampleReview2.save();
  await newCourse3.save();
  await sampleReview3.save();
  await sampleReview4.save();

  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  serverCloseHandle = app.listen(testingPort, async () => { });
  configure(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  serverCloseHandle.close();
  mockVerification.mockRestore();
});

describe('tests', () => {
  it('makeReviewVisible-works', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/makeReviewVisible`, { review: sampleReview, token: "non-empty" });
    expect(res.data.result.resCode).toEqual(1);
    const course = await Classes.findOne({ _id: newCourse1._id }).exec();
    expect(course.classDifficulty).toEqual(sampleReview.difficulty);
    expect(course.classWorkload).toEqual(sampleReview.workload);
    expect(course.classRating).toEqual(sampleReview.rating);
  });

  it('updateAllCourseMetrics-works', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/updateAllCourseMetrics`, { token: "non-empty" });
    expect(res.data.result.resCode).toEqual(1);
    const course1 = await Classes.findOne({ _id: newCourse2._id }).exec();
    expect(course1.classDifficulty).toEqual(2);
    expect(course1.classWorkload).toEqual(3);
    expect(course1.classRating).toEqual(1);
    const course2 = await Classes.findOne({ _id: newCourse3._id }).exec();
    expect(course2.classDifficulty).toEqual(3);
    expect(course2.classWorkload).toEqual(4);
    expect(course2.classRating).toEqual(2);
  });

  it('undoReportReview-works', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/undoReportReview`, { review: reviewToUndoReport, token: "non empty" });
    expect(res.data.result.resCode).toEqual(1);
    const reviewFromDb = await Reviews.findById(reviewToUndoReport._id).exec();
    expect(reviewFromDb.visible).toEqual(1);
    await reviewToUndoReport.remove();
  });

  it('removeReview-works', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/removeReview`, { review: sampleReview, token: "non-empty" });
    expect(res.data.result.resCode).toEqual(1);
    const course = await Classes.findById(newCourse1._id);
    expect(course.classDifficulty).toEqual(null);
    expect(course.classWorkload).toEqual(null);
    expect(course.classRating).toEqual(null);
  });
});

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { configure } from "./endpoints";
import { Classes, Students, Subjects } from './dbDefs';

let mongoServer: MongoMemoryServer;

const testingPort = 37760;

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  await mongoose.connection.collections.classes.createIndex({ classFull: "text" });
  await mongoose.connection.collections.subjects.createIndex({ subShort: "text" });
  await mongoose.connection.collections.professors.createIndex({ fullName: "text" });

  const newUser = new Students({
    _id: "Irrelevant",
    firstName: "John",
    lastName: "Smith",
    netId: "js0",
    affiliation: null,
    token: null,
    privilege: "regular",
  });

  await newUser.save();

  const newSubject1 = new Subjects({
    _id: "newSubject1",
    subShort: "MORK",
    subFull: "Study of Angry Fungi",
  });

  await newSubject1.save();

  const newCourse1 = new Classes({
    _id: "newCourse1",
    classSub: "MORK",
    classNum: "1110",
    classTitle: "Introduction to Testing",
    classFull: "MORK 1110: Introduction to Testing",
    classSems: ["FA19"],
    classProfessors: ["Some Phd"],
    classRating: 1,
    classWorkload: 2,
    classDifficulty: 3,
  });

  await newCourse1.save();

  const newCourse2 = new Classes({
    _id: "newCourse2",
    classSub: "MORK",
    classNum: "2110",
    classTitle: "Intermediate Testing",
    classFull: "MORK 2110: Intermediate Testing",
    classSems: ["SP20"],
    classPrereq: [newCourse1._id],
    classProfessors: ["Some Phd"],
    classRating: 3,
    classWorkload: 4,
    classDifficulty: 5,
  });

  await newCourse2.save();

  // Set up a mock version of the v2 endpoints to test against
  const app = express();
  app.listen(testingPort, async () => {});
  configure(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('tests', () => {
  it('getClassesByQuery-works', async () => {
    expect(await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { "not query": "other" }).catch((e) => "failed!")).toBe("failed!");
    const res = await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { query: "MORK 1" });
    // we expect it to be MORK 1110 first, and then MORK 2110
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual(["MORK 1110: Introduction to Testing", "MORK 2110: Intermediate Testing"]);
  });
});

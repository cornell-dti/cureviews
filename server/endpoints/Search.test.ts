import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { configure } from "../endpoints";
import { Classes, Students, Subjects, Professors } from "../dbDefs";

let mongoServer: MongoMemoryServer;
let serverCloseHandle;

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
    classProfessors: ["Gazghul Thraka"],
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
    classProfessors: ["Gazghul Thraka"],
    classRating: 3,
    classWorkload: 4,
    classDifficulty: 5,
  });

  await newCourse2.save();

  const madSubject = new Subjects({
    _id: "angry subject",
    subShort: "MAD",
    subFull: "The Study of Anger Issues",
  });

  await madSubject.save();

  const fednSubject = new Subjects({
    _id: "federation subject",
    subShort: "FEDN",
    subFull: "The Study of Where No Man has Gone Before!",
  });

  await fednSubject.save();

  const prof1 = new Professors({
    _id: "prof 1",
    fullName: "Gazghul Thraka",
    courses: ["newCourse1", "newCourse2"],
    major: "MORK",
  });

  await prof1.save();

  const prof2 = new Professors({
    _id: "prof 2",
    fullName: "Jean-Luc Picard",
    courses: [],
    major: "FEDN",
  });

  await prof2.save();

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
    expect(await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { "not query": "other" }).catch((e) => "failed!")).toBe("failed!");

    const res = await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { query: "MORK 1" });
    // we expect it to be MORK 1110 first, and then MORK 2110
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual(["MORK 1110: Introduction to Testing", "MORK 2110: Intermediate Testing"]);
  });

  it('getSubjectsByQuery-works', async () => {
    expect(await axios.post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, { "not query": "other" }).catch((e) => "failed!")).toBe("failed!");

    const res = await axios.post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, { query: "MORK" });
    expect(res.data.result.map((e) => e.subShort)).toContain("MORK");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MAD");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("FEDN");
  });

  it('getProfessorsByQuery-works', async () => {
    expect(await axios.post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, { "not query": "other" }).catch((e) => "failed!")).toBe("failed!");

    const res1 = await axios.post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, { query: "Gazghul Thraka" });
    expect(res1.data.result.map((e) => e.fullName)).toContain("Gazghul Thraka");
    expect(res1.data.result.map((e) => e.fullName)).not.toContain("Jean-Luc Picard");

    const res2 = await axios.post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, { query: "Jean-Luc Picard" });
    expect(res2.data.result.map((e) => e.fullName)).not.toContain("Gazghul Thraka");
    expect(res2.data.result.map((e) => e.fullName)).toContain("Jean-Luc Picard");
  });

  //Query has no matching results
  it('getClassesByQuery-no matching classes', async () => {
    expect(await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { "not query": "other" }).catch((e) => "failed!")).toBe("failed!");

    const res = await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { query: "random" });
    //we expect no results to be returned
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.classFull)).not.toContain(["MORK 1110: Introduction to Testing", "MORK 2110: Intermediate Testing"]);
  });

  it('getSubjectsByQuery-no matching subjects', async () => {
    expect(await axios.post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, { "not query": "other" }).catch((e) => "failed!")).toBe("failed!");

    const res = await axios.post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, { query: "RAND" });
    //we expect no results to be returned
    expect(res.data.result.map((e) => e.subShort)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MORK");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MAD");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("FEDN");
  });

  it('getProfessorsByQuery-no matching professors', async () => {
    expect(await axios.post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, { "not query": "other" }).catch((e) => "failed!")).toBe("failed!");

    const res = await axios.post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, { query: "Random Professor" });
    //we expect no results to be returned
    expect(res.data.result.map((e) => e.fullName)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.fullName)).not.toContain("Gazghul Thraka");
    expect(res.data.result.map((e) => e.fullName)).not.toContain("Jean-Luc Picard");
  });

  // Will not accept non-ascii:
  it('getClassesByQuery-non Ascii', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { query: "भारत" }).catch((e) => e);
    expect(res.message).toBe("Request failed with status code 400");
  });

  it('getSubjectsByQuery-non Ascii', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, { query: "भारत" }).catch((e) => e);
    expect(res.message).toBe("Request failed with status code 400");
  });

  it('getProfessorsByQuery-non Ascii', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, { query: "भारत" }).catch((e) => e);
    expect(res.message).toBe("Request failed with status code 400");
  });

  it('getClassesByQuery- empty query', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/getClassesByQuery`, { query: "" }).catch((e) => e);
    expect(res.message).toBe("Request failed with status code 400");
  });

});

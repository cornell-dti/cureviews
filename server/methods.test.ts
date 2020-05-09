import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Class, Classes, Validation, Student, Students, Subjects } from './dbDefs';
import { Meteor } from './shim';
import { isSubShorthand, editDistance } from './methods';

// May require additional time for downloading 100 mb (!) worth of MongoDB binaries
// **We might not want to run this with CI**
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  // insert some data to play with
  // be careful (!) inserting more here may mess with tests
  // so choose unique and new values for all fields
  // I generally choose Mork to exist, and Gork not to

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('tests', () => {
  // simple test to see if jest works as expected with typescript
  it('jest-async-works', async () => {
    const v = parseInt("1", 10) === 1;
    expect(v).toBe(true);
  });

  // make sure that our fake mongodb server exists
  it('mongoose-works', async () => {
    // mess with validation because it isn't touched anywhere else
    expect(await Validation.countDocuments({}).exec()).toBe(0);
    expect(await Validation.findOne({}).exec()).toBeNull();
  });

  // test the fact that the meteor shim exists at last one of the methods from methods.ts imported
  // also test "getUserByNetId" while we are at it
  it('meteor-shim-exists', async () => {
    const user = await Meteor.call<Student | null>("getUserByNetId", "js0");
    expect(user._id).toBe("Irrelevant");
    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Smith");
    expect(user.netId).toBe("js0");
    expect(user.privilege).toBe("regular");
    expect(user.affiliation).toBeNull();
    expect(user.token).toBeNull();

    const no_user = await Meteor.call<Student | null>("getUserByNetId", "bop");
    expect(no_user).toBeNull();
  });

  // test getCoursesByMajor
  it('get-courses-by-major', async () => {
    const classes = await Meteor.call<Class[]>("getCoursesByMajor", "MORK");
    expect(classes.length).toBe(2);

    const index = classes[0].classNum == "1110" ? 0 : 1;
    const mork1110 = classes[index];
    const mork2110 = classes[(index + 1) % 2];

    expect(mork1110.classNum).toBe("1110");
    expect(mork2110.classNum).toBe("2110");
    expect(mork1110.classSub).toBe(mork2110.classSub);
    expect(mork2110.classPrereq[0]).toBe(mork1110._id);

    const no_classes = await Meteor.call<Class[]>("getCoursesByMajor", "GORK");
    expect(no_classes.length).toBe(0);
  });

  // test getCourseById
  it('get-course-by-id', async () => {
    const mork1110 = await Meteor.call<Class | null>("getCourseById", "newCourse1");
    const mork2110 = await Meteor.call<Class | null>("getCourseById", "newCourse2");

    expect(mork1110.classNum).toBe("1110");
    expect(mork2110.classNum).toBe("2110");
    expect(mork1110.classSub).toBe(mork2110.classSub);
    expect(mork2110.classPrereq[0]).toBe(mork1110._id);

    const no_course = await Meteor.call<Class | null>("getCourseById", "gork's course");
    expect(no_course).toBeNull();
  });

  // test isSubShorthand
  it('is-sub-shorthand', async () => {
    const morkIsShorthand = await isSubShorthand("MORK");
    expect(morkIsShorthand).toBe(true);

    const gorkIsShorthand = await isSubShorthand("GORK");
    expect(gorkIsShorthand).toBe(false);
  });

  // test the new edit distance for searching
  it('edit-distance-test', async () => {
    // tests on fixed strings
    expect(editDistance("", "")).toBe(0); // identity
    expect(editDistance("abc", "abc")).toBe(0);

    expect(editDistance("z", "")).toBe(1); // deletion
    expect(editDistance("a word", " word")).toBe(1);

    expect(editDistance("", "a")).toBe(1); // insertion
    expect(editDistance("zorb", "zorb2")).toBe(1);

    expect(editDistance("a", "b")).toBe(1); // substitution
    expect(editDistance("minus", "minis")).toBe(1);

    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("GAMBLER", "gambler")).toBe(7); // upper case treated differently
    expect(editDistance("the end of an era", "the beginning of an era")).toBe(7);

    // increasing string
    const original = "kitten";
    let temp = original;

    for (let i = 0; i < 100; i++) {
      temp += "a";
      expect(editDistance(original, temp)).toBe(i + 1);
    }

    // how many random draws for each sub-test?
    const amount = 1000;

    // levenstein distance is symmetric
    for (let i = 0; i < amount; i++) {
      const str1 = Math.random().toString(36);
      const str2 = Math.random().toString(36);
      const d1 = editDistance(str1, str2);
      const d2 = editDistance(str2, str1);

      if (d1 !== d2) {
        console.log(`Errored on: ${str1} ${str2}`);
      }

      expect(d1).toBe(d2);
    }

    // levenstein distances can not be greater than the length of the longer string
    for (let i = 0; i < amount; i++) {
      const str1 = Math.random().toString(36);
      const str2 = Math.random().toString(36);
      const d = editDistance(str1, str2);

      if (d > Math.max(str1.length, str2.length)) {
        console.log(`Errored on: ${str1} ${str2}`);
      }

      expect(d).toBeLessThanOrEqual(Math.max(str1.length, str2.length));
    }

    // levenstein distances obey the triangle inequality
    for (let i = 0; i < amount; i++) {
      const str1 = Math.random().toString(36);
      const str2 = Math.random().toString(36);
      const str3 = Math.random().toString(36);

      const d1 = editDistance(str1, str2);
      const d2 = editDistance(str2, str3);
      const d3 = editDistance(str3, str1);

      if (d1 + d2 < d3 || d2 + d3 < d1 || d3 + d1 < d2) {
        console.log(`Errored on: ${str1} ${str2} ${str3}`);
      }

      expect(d1 + d2).toBeGreaterThanOrEqual(d3);
      expect(d2 + d3).toBeGreaterThanOrEqual(d1);
      expect(d3 + d1).toBeGreaterThanOrEqual(d2);
    }

    // levenstein distances can not be less than the difference in lengths
    for (let i = 0; i < amount; i++) {
      const str1 = Math.random().toString(36);
      const str2 = Math.random().toString(36);
      const d = editDistance(str1, str2);

      if (d < Math.abs(str1.length - str2.length)) {
        console.log(`Errored on: ${str1} ${str2}`);
      }

      expect(d).toBeGreaterThanOrEqual(Math.abs(str1.length - str2.length));
    }
  });
});

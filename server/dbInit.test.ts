// Set up fake endpoints to query
import express from "express";
import axios from "axios";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Subjects, Classes, Professors } from "./dbDefs";
import { fetchSubjects, fetchClassesForSubject, fetchAddCourses } from "./dbInit";

// May require additional time for downloading 100 mb (!) worth of MongoDB binaries
// **We might not want to run this with CI**
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let testServer: MongoMemoryServer;
let serverCloseHandle;

const testingPort = 27760;
const testingEndpoint = `http://localhost:${testingPort}/`;

// Configure a mongo server and fake endpoints for the tests to use
beforeAll(async () => {
  // get mongoose all set up
  testServer = new MongoMemoryServer();
  const mongoUri = await testServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.set('useFindAndModify', false);

  await new Subjects({
    _id: "some id",
    subShort: "gork",
    subFull: "Study of Angry Fungi",
  }).save();

  await new Classes({
    _id: "some other id",
    classSub: "gork",
    classNum: "1110",
    classTitle: "Introduction to Angry Fungi",
    classFull: "gork 1110 Introduction to Angry Fungi",
    classSems: ["FA19"],
    classProfessors: ["Prof. Thraka"],
    classRating: 5,
    classWorkload: 5,
    classDifficulty: 5,
  }).save();

  // We need to pretend to have access to a cornell classes endpoint
  const app = express();
  serverCloseHandle = app.listen(testingPort);

  app.get("/hello", (req, res) => {
    res.send("Hello world");
  });

  // Fake subjects endpoint
  app.get("/config/subjects.json", (req, res) => {
    // simulate only having FA20 data.
    // express did not allow me to include a "?" literal in the path for some strange reason
    // Maybe fix in the future?
    if (!req.originalUrl.includes("FA20")) {
      res.send({
        status: "failure",
      });
    }

    res.send({
      status: "success",
      data: {
        subjects: [
          { descr: "Study of Fungi", descrformal: "The Study of Fungi", value: "gork" },
          { descr: "Study of Space", descrformal: "The Study of Where No One has Gone Before", value: "fedn" },
        ],
      },
    });
  });

  // Fake classes endpoint
  app.get("/search/classes.json", (req, res) => {
    // simulate only having data for the gork subject.
    // see above
    if (!req.originalUrl.includes("gork")) {
      res.send({
        status: "failure",
      });
    }

    res.send({
      status: "success",
      data: {
        classes: [
          {
            subject: "gork",
            catalogNbr: "1110",
            titleLong: "Introduction to Angry Fungi",
            randoJunk: "Making sure this scauses no issues",
            enrollGroups: [{ classSections: [{ ssrComponent: "LEC", meetings: [{ instructors: [{ firstName: "Prof.", lastName: "Thraka" }] }] }] }],
          },
          {
            junk: "nada",
            subject: "gork",
            catalogNbr: "2110",
            titleLong: "Advanced Study of Angry Fungi",
            enrollGroups: [{
              classSections: [
                { ssrComponent: "LEC", meetings: [{ instructors: [{ firstName: "Prof.", lastName: "Thraka" }, { firstName: "Prof.", lastName: "Urgok" }] }] },
              ],
            }],
          },
        ],
      },
    });
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await testServer.stop();
  serverCloseHandle.close();
});

describe('tests', () => {
  it("dbInit-db-works", async () => {
    expect((await Subjects.findOne({ subShort: "gork" })).subShort).toBe("gork");
    expect((await Classes.findOne({ classSub: "gork", classNum: "1110" })).classSub).toBe("gork");
  });

  // Does the internal testing endpoint exist?
  it("dbInit-test-endpoint-exists", async () => {
    const response = await axios.get(`${testingEndpoint}hello`);
    expect(response.data).toBe("Hello world");
    expect(response.data).not.toBe("Something the endpoint is not to return!");
  });

  // Does fetching the subjects collection work as expected?
  it("fetching-roster-works", async () => {
    const response = await fetchSubjects(testingEndpoint, "FA20");
    expect(response.length).toBe(2);
    expect(response[0].descrformal).toBe("The Study of Fungi");
    expect(response[0].value).toBe("gork");
    expect(response[1].value).toBe("fedn");

    // No data for FA19!
    const nil = await fetchSubjects(testingEndpoint, "FA19");
    expect(nil).toBeNull();
  });

  // Does fetching the classes collection work as expected?
  it("fetching-classes-by-subject-works", async () => {
    const response = await fetchClassesForSubject(testingEndpoint, "FA20", { descrformal: "The Study of AngryFungi", value: "gork" });
    expect(response.length).toBe(2);
    expect(response[0].subject).toBe("gork");
    expect(response[0].catalogNbr).toBe("1110");
    expect(response[0].titleLong).toBe("Introduction to Angry Fungi");
    expect(response[1].titleLong).toBe("Advanced Study of Angry Fungi");

    // No fedn classes, only gork classes!
    const nil = await fetchClassesForSubject(testingEndpoint, "FA20", { descrformal: "The Study of Where No One has Gone Before", value: "fedn" });
    expect(nil).toBeNull();
  });

  it("full-scraping-works", async () => {
    const worked = await fetchAddCourses(testingEndpoint, "FA20");
    expect(worked).toBe(true);

    // did it add the fedn subject?
    expect((await Subjects.findOne({ subShort: "fedn" }).exec()).subFull).toBe("The Study of Where No One has Gone Before");

    // did it update the semesters on gork 1110?
    // notice the .lean(), which changes some of the internals of what mongo returns
    const class1 = await Classes.findOne({ classSub: "gork", classNum: "1110" }).lean().exec();
    expect(class1.classSems).toStrictEqual(["FA19", "FA20"]);

    // did it add the gork 2110 Class?
    const class2 = await Classes.findOne({ classSub: "gork", classNum: "2110" }).exec();
    expect(class2.classTitle).toBe("Advanced Study of Angry Fungi");

    // Did it update the classes for the first professor
    const prof1 = await Professors.findOne({ fullName: "Prof. Thraka" }).lean().exec();
    expect(prof1.courses).toContain(class1._id);
    expect(prof1.courses).toContain(class2._id);

    // Did it add the second professor with the right class id?
    const prof2 = await Professors.findOne({ fullName: "Prof. Urgok" }).lean().exec();
    expect(prof2.courses).toStrictEqual([class2._id]);
  });
});

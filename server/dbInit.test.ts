// Set up fake endpoints to query
import express from "express";
import axios from "axios";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Subjects, Classes } from "./dbDefs";
import { fetchSubjects, fetchClassesForSubject, fetchAddCourses } from "./dbInit";

// May require additional time for downloading 100 mb (!) worth of MongoDB binaries
// **We might not want to run this with CI**
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let testServer: MongoMemoryServer;

// Configure a mongo server and fake enpoints for the tests to use
beforeAll(async () => {
  // get mongoose all set up
  testServer = new MongoMemoryServer();
  const mongoUri = await testServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  await new Subjects({
    _id: "some id",
    subShort: "GORK",
    subFull: "Study of Angry Fungi",
  }).save();

  await new Classes({
    _id: "some other id",
    classSub: "GORK",
    classNum: "1110",
    classTitle: "Introduction to Angry Fungi",
    classFull: "GORK 1110 Introduction to Angry Fungi",
    classSems: ["FA19"],
    classProfessors: ["Prof. Thraka"],
    classRating: 5,
    classWorkload: 5,
    classDifficulty: 5,
  }).save().catch((err) => { console.log(err); });

  console.log(await Subjects.findOne({ subShort: "GORK" }));

  // We need to pretend to have access to a cornell classes endpoint
  const app = express();
  app.listen(27760, async () => {});

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
          { descr: "Study of Fungi", descrformal: "The Study of Fungi", value: "GORK" },
          { descr: "Study of Space", descrformal: "The Study of Where No One has Gone Before", value: "FEDN" },
        ],
      },
    });
  });

  // Fake classes endpoint
  app.get("/search/classes.json", (req, res) => {
    // simulate only having data for the GORK subject.
    // see above
    if (!req.originalUrl.includes("GORK")) {
      res.send({
        status: "failure",
      });
    }

    res.send({
      status: "success",
      data: {
        classes: [
          { subject: "GORK", catalogNbr: "1110", titleLong: "Introduction to Angry Fungi", randoJunk: "Making sure this scauses no issues" },
          { junk: "nada", subject: "GORK", catalogNbr: "2110", titleLong: "Advanced Study of Angry Fungi" },
        ],
      },
    });
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await testServer.stop();
});

const testingEndpoint = "http://localhost:27760/";

describe('tests', () => {
  it("dbInit-db-works", async () => {
    expect((await Subjects.findOne({ subShort: "GORK" })).subShort).toBe("GORK");
    expect((await Classes.findOne({ classSub: "GORK", classNum: "1110" })).classSub).toBe("GORK");
  });

  // Does the internal testing endpoint exist?
  it("dbInit-test-enpoint-exists", async () => {
    const response = await axios.get(`${testingEndpoint}hello`);
    expect(response.data).toBe("Hello world");
    expect(response.data).not.toBe("Something the enpoint is not to return!");
  });

  // Does fetching the subjects collection work as expected?
  it("fetching-roster-works", async () => {
    const response = await fetchSubjects(testingEndpoint, "FA20");
    expect(response.length).toBe(2);
    expect(response[0].descrformal).toBe("The Study of Fungi");
    expect(response[0].value).toBe("GORK");
    expect(response[1].value).toBe("FEDN");

    // No data for FA19!
    const nil = await fetchSubjects(testingEndpoint, "FA19");
    expect(nil).toBeNull();
  });

  // Does fetching the classes collection work as expected?
  it("fetching-classes-by-subject-works", async () => {
    const response = await fetchClassesForSubject(testingEndpoint, "FA20", { descrformal: "The Study of AngryFungi", value: "GORK" });
    expect(response.length).toBe(2);
    expect(response[0].subject).toBe("GORK");
    expect(response[0].catalogNbr).toBe("1110");
    expect(response[0].titleLong).toBe("Introduction to Angry Fungi");
    expect(response[1].titleLong).toBe("Advanced Study of Angry Fungi");

    // No FEDN classes, only GORK classes!
    const nil = await fetchClassesForSubject(testingEndpoint, "FA20", { descrformal: "The Study of Where No One has Gone Before", value: "FEDN" });
    expect(nil).toBeNull();
  });

  it("full-scraping-works", async () => {
    const worked = await fetchAddCourses(testingEndpoint, "FA20");
    expect(worked).toBe(true);

    // did it add the FEDN subject?
    expect((await Subjects.findOne({ subShort: "FEDN" }).exec()).subFull).toBe("The Study of Where No One has Gone Before");

    // did it update the semesters on GORK 1110?
    // notice the .lean(), which changes some of the internals of what mongo returns
    expect((await Classes.findOne({ classSub: "GORK", classNum: "1110" }).lean().exec()).classSems).toStrictEqual(["FA19", "FA20"]);

    // did it add the GORK 2110 Class?
    expect((await Classes.findOne({ classSub: "GORK", classNum: "2110" }).exec()).classTitle).toBe("Advanced Study of Angry Fungi");
  });
});

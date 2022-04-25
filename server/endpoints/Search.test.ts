import axios from "axios";
import { Student, Class, Subject, Professor } from "common";
import TestingServer, { testingPort } from "./TestServer";

const testServer = new TestingServer(testingPort);

beforeAll(async () => {
  const testStudents: Student[] = [
    {
      _id: "Irrelevant",
      firstName: "John",
      lastName: "Smith",
      netId: "js0",
      affiliation: null,
      token: null,
      privilege: "regular",
      reviews: [],
      likedReviews: [],
      lastReported: new Date(),
      numReported: 0,
    },
  ];

  const testClasses: Class[] = [
    {
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
      classPrereq: [],
      crossList: [],
    },
    {
      _id: "newCourse2",
      classSub: "MORK",
      classNum: "2110",
      classTitle: "Intermediate Testing",
      classFull: "MORK 2110: Intermediate Testing",
      classSems: ["SP20"],
      classPrereq: ["newCourse1"], // the class above
      classProfessors: ["Gazghul Thraka"],
      classRating: 3,
      classWorkload: 4,
      classDifficulty: 5,
      crossList: [],
    },
  ];

  const testSubjects: Subject[] = [
    {
      _id: "newSubject1",
      subShort: "MORK",
      subFull: "Study of Angry Fungi",
    },
    {
      _id: "angry subject",
      subShort: "MAD",
      subFull: "The Study of Anger Issues",
    },
    {
      _id: "federation subject",
      subShort: "FEDN",
      subFull: "The Study of Where No Man has Gone Before!",
    },
  ];

  const testProfessors: Professor[] = [
    {
      _id: "prof_1",
      fullName: "Gazghul Thraka",
      courses: ["newCourse1", "newCourse2"],
      major: "MORK",
    },
    {
      _id: "prof_2",
      fullName: "Jean-Luc Picard",
      courses: [],
      major: "FEDN",
    },
  ];

  await testServer.setUpDB(
    undefined,
    testStudents,
    testClasses,
    testProfessors,
    testSubjects,
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
});

describe("tests", () => {
  it("getClassesByQuery-works", async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getClassesByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res1 = await axios.post(
      `http://localhost:${testingPort}/v2/getClassesByQuery`,
      { query: "MORK 1" },
    );
    // we expect it to be MORK 1110 first, and then MORK 2110
    expect(res1.data.result.map((e) => e.classFull)).toStrictEqual([
      "MORK 1110: Introduction to Testing",
      "MORK 2110: Intermediate Testing",
    ]);
  });

  it('getClassesByQuery-works "MORK1" ', async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getClassesByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res = await axios.post(
      `http://localhost:${testingPort}/v2/getClassesByQuery`,
      { query: "MORK1" },
    );
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([
      "MORK 1110: Introduction to Testing",
      "MORK 2110: Intermediate Testing",
    ]);
  });

  it('getClassesByQuery-works "MORK 1110" ', async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getClassesByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res = await axios.post(
      `http://localhost:${testingPort}/v2/getClassesByQuery`,
      { query: "MORK1110" },
    );
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([
      "MORK 1110: Introduction to Testing",
    ]);
  });

  it("getSubjectsByQuery-works", async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res = await axios.post(
      `http://localhost:${testingPort}/v2/getSubjectsByQuery`,
      { query: "MORK" },
    );
    expect(res.data.result.map((e) => e.subShort)).toContain("MORK");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MAD");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("FEDN");
  });

  it("getProfessorsByQuery-works", async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res1 = await axios.post(
      `http://localhost:${testingPort}/v2/getProfessorsByQuery`,
      { query: "Gazghul Thraka" },
    );
    expect(res1.data.result.map((e) => e.fullName)).toContain("Gazghul Thraka");
    expect(res1.data.result.map((e) => e.fullName)).not.toContain(
      "Jean-Luc Picard",
    );

    const res2 = await axios.post(
      `http://localhost:${testingPort}/v2/getProfessorsByQuery`,
      { query: "Jean-Luc Picard" },
    );
    expect(res2.data.result.map((e) => e.fullName)).not.toContain(
      "Gazghul Thraka",
    );
    expect(res2.data.result.map((e) => e.fullName)).toContain(
      "Jean-Luc Picard",
    );
  });

  // Query has no matching results:
  it("getClassesByQuery-no matching classes", async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getClassesByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res = await axios.post(
      `http://localhost:${testingPort}/v2/getClassesByQuery`,
      { query: "random" },
    );
    // we expect no results to be returned
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.classFull)).not.toContain([
      "MORK 1110: Introduction to Testing",
      "MORK 2110: Intermediate Testing",
    ]);
  });

  it("getSubjectsByQuery-no matching subjects", async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res = await axios.post(
      `http://localhost:${testingPort}/v2/getSubjectsByQuery`,
      { query: "RAND" },
    );
    // we expect no results to be returned
    expect(res.data.result.map((e) => e.subShort)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MORK");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MAD");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("FEDN");

    const res2 = await axios.post(
      `http://localhost:${testingPort}/v2/getSubjectsByQuery`,
      { query: "RAND1" },
    );
    expect(res2.data.result.map((e) => e.subShort)).toStrictEqual([]);
  });

  it("getProfessorsByQuery-no matching professors", async () => {
    expect(
      await axios
        .post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res = await axios.post(
      `http://localhost:${testingPort}/v2/getProfessorsByQuery`,
      { query: "Random Professor" },
    );
    // we expect no results to be returned
    expect(res.data.result.map((e) => e.fullName)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.fullName)).not.toContain(
      "Gazghul Thraka",
    );
    expect(res.data.result.map((e) => e.fullName)).not.toContain(
      "Jean-Luc Picard",
    );
  });

  // Will accept ascii, but give no guarantees as to what is returned.
  it("getClassesByQuery-non Ascii", async () => {
    const res = await axios
      .post(`http://localhost:${testingPort}/v2/getClassesByQuery`, {
        query: "भारत",
      })
      .catch((e) => e);
    expect(res.data.result).toBeTruthy();
  });

  // Not for these however.
  it("getSubjectsByQuery-non Ascii", async () => {
    const res = await axios
      .post(`http://localhost:${testingPort}/v2/getSubjectsByQuery`, {
        query: "भारत",
      })
      .catch((e) => e);
    expect(res.message).toBe("Request failed with status code 400");
  });

  it("getProfessorsByQuery-non Ascii", async () => {
    const res = await axios
      .post(`http://localhost:${testingPort}/v2/getProfessorsByQuery`, {
        query: "भारत",
      })
      .catch((e) => e);
    expect(res.message).toBe("Request failed with status code 400");
  });

  it("getClassesByQuery- empty query", async () => {
    const res = await axios
      .post(`http://localhost:${testingPort}/v2/getClassesByQuery`, {
        query: "",
      })
      .catch((e) => e);
    expect(res.message).toBe("Request failed with status code 400");
  });
});

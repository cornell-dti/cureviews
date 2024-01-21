import axios from "axios";

import {
  testClasses,
  testProfessors,
  testStudents,
  testSubjects,
  testReviews,
} from "./mocks/InitMockDb";
import { testServer, testPort } from "./mocks/MockServer";

beforeAll(async () => {
  await testServer.setUpDB(
    testReviews,
    testStudents,
    testClasses,
    testProfessors,
    testSubjects,
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
});

describe("search functionality unit tests", () => {
  it("getClassesByQuery - invalid body is sent", async () => {
    expect(
      await axios
        .post(`http://localhost:${testPort}/api/getClassesByQuery`, {
          "other query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");
  });

  it('getClassesByQuery - valid query "MORK 1" sent with correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/getClassesByQuery`,
      {
        query: "MORK 1",
      },
    );

    // we expect it to be MORK 1110 first, and then MORK 2110
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([
      "MORK 1110: Introduction to Testing",
      "MORK 2110: Intermediate Testing",
    ]);
  });

  it('getClassesByQuery - valid query: "MORK1" sent with correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/getClassesByQuery`,
      {
        query: "MORK1",
      },
    );

    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([
      "MORK 1110: Introduction to Testing",
      "MORK 2110: Intermediate Testing",
    ]);
  });

  it('getClassesByQuery - valid query: "MORK 1110" sent with correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/getClassesByQuery`,
      { query: "MORK1110" },
    );
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([
      "MORK 1110: Introduction to Testing",
    ]);
  });

  it('getSubjectsByQuery - valid query subject: "MORK" sent with correct order', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/getSubjectsByQuery`,
      { query: "MORK" },
    );
    expect(res.data.result.map((e) => e.subShort)).toContain("MORK");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MAD");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("FEDN");
  });

  it('getProfessorsByQuery - query professor: "Gazghul Thraka" sent', async () => {
    const res1 = await axios.post(
      `http://localhost:${testPort}/api/getProfessorsByQuery`,
      { query: "Gazghul Thraka" },
    );
    expect(res1.data.result.map((e) => e.fullName)).toContain("Gazghul Thraka");
    expect(res1.data.result.map((e) => e.fullName)).not.toContain(
      "Jean-Luc Picard",
    );
  });

  it('getProfessorsByQuery - query professor: "Jean-Luc Picard" sent', async () => {
    const res2 = await axios.post(
      `http://localhost:${testPort}/api/getProfessorsByQuery`,
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
  it("getClassesByQuery - no matching classes", async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/getClassesByQuery`,
      {
        query: "random",
      },
    );

    // we expect no results to be returned
    expect(res.data.result.map((e) => e.classFull)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.classFull)).not.toContain([
      "MORK 1110: Introduction to Testing",
      "MORK 2110: Intermediate Testing",
    ]);
  });

  it("getSubjectsByQuery - no matching subjects", async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/getSubjectsByQuery`,
      { query: "RAND" },
    );
    // we expect no results to be returned
    expect(res.data.result.map((e) => e.subShort)).toStrictEqual([]);
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MORK");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("MAD");
    expect(res.data.result.map((e) => e.subShort)).not.toContain("FEDN");
  });

  it("getProfessorsByQuery - no matching professors", async () => {
    expect(
      await axios
        .post(`http://localhost:${testPort}/api/getProfessorsByQuery`, {
          "not query": "other",
        })
        .catch((e) => "failed!"),
    ).toBe("failed!");

    const res = await axios.post(
      `http://localhost:${testPort}/api/getProfessorsByQuery`,
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
  it("getClassesByQuery - non Ascii query", async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/getClassesByQuery`, {
        query: "भारत",
      })
      .catch((e) => e);
    expect(res.response.status).toBe(400);
  });

  // Not for these however.
  it("getSubjectsByQuery - non Ascii query", async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/getSubjectsByQuery`, {
        query: "भारत",
      })
      .catch((e) => e);
    expect(res.response.status).toBe(400);
  });

  it("getProfessorsByQuery - non Ascii query", async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/getProfessorsByQuery`, {
        query: "भारत",
      })
      .catch((e) => e);
    expect(res.response.status).toBe(400);
  });

  it("getClassesByQuery - empty query", async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/getClassesByQuery`, {
        query: "",
      })
      .catch((e) => e);

    expect(res.response.status).toBe(400);
  });
});

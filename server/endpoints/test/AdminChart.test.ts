import axios from "axios";
import { TokenPayload } from "google-auth-library";

import { Class, Review, Student, Subject } from "common";
import * as Auth from "../auth/Auth";
import TestingServer, { testingPort } from "./TestServer";

const testServer = new TestingServer(testingPort);

export const testClasses: Class[] = [
  {
    _id: "oH37S3mJ4eAsktypy",
    classSub: "cs",
    classNum: "2110",
    classTitle: "Object-Oriented Programming and Data Structures",
    classPrereq: [],
    classFull: "cs 2110 object-oriented programming and data structures",
    classSems: [
      "FA14",
      "SP15",
      "SU15",
      "FA15",
      "SP16",
      "SU16",
      "FA16",
      "SP17",
      "SU17",
      "FA17",
      "SP18",
      "FA18",
      "SU18",
      "SP19",
      "FA19",
      "SU19",
    ],
    crossList: ["q75SxmqkTFEfaJwZ3"],
    classProfessors: [
      "David Gries",
      "Douglas James",
      "Siddhartha Chaudhuri",
      "Graeme Bailey",
      "John Foster",
      "Ross Tate",
      "Michael George",
      "Eleanor Birrell",
      "Adrian Sampson",
      "Natacha Crooks",
      "Anne Bracy",
      "Michael Clarkson",
    ],
    classDifficulty: 2.9,
    classRating: null,
    classWorkload: 3,
  },
  {
    _id: "oH37S3mJ4eAsdsdpy",
    classSub: "cs",
    classNum: "2112",
    classTitle: "Honors Object-Oriented Programming and Data Structures",
    classPrereq: [],
    classFull: "cs 2112 Honors object-oriented programming and data structures",
    classSems: [
      "FA14",
      "SP15",
      "SU15",
      "FA15",
      "SP16",
      "SU16",
      "FA16",
      "SP17",
      "SU17",
      "FA17",
      "SP18",
      "FA18",
      "SU18",
      "SP19",
      "FA19",
      "SU19",
    ],
    crossList: [],
    classProfessors: ["Andrew Myers"],
    classDifficulty: 5.0,
    classRating: null,
    classWorkload: 5.0,
  },
  {
    _id: "fhgweiufhwu23",
    classSub: "math",
    classNum: "3110",
    classTitle: "Intro to real analysis",
    classPrereq: [],
    classFull: "math 3110 Intro to real analysis",
    classSems: [
      "FA14",
      "SP15",
      "SU15",
      "FA15",
      "SP16",
      "SU16",
      "FA16",
      "SP17",
      "SU17",
      "FA17",
      "SP18",
      "FA18",
      "SU18",
      "SP19",
      "FA19",
      "SU19",
    ],
    crossList: [],
    classProfessors: ["Saloff-Coste"],
    classDifficulty: 3.9,
    classRating: null,
    classWorkload: 3.5,
  },
];

// inital reviews that are present at start of all tests.
export const testReviews: Review[] = [
  {
    _id: "4Y8k7DnX3PLNdwRPr",
    text: "review text for cs 2110",
    difficulty: 1,
    class: "oH37S3mJ4eAsktypy",
    visible: 1,
    reported: 0,
    user: "nje",
    likedBy: [],
    date: new Date(),
  },
  {
    _id: "4Y8k7DnX3PLNdwRPq",
    text: "review text for cs 2110 number 2",
    difficulty: 1,
    class: "oH37S3mJ4eAsktypy",
    visible: 1,
    reported: 0,
    user: "nje",
    likedBy: [],
    date: new Date(),
  },
  {
    _id: "4Y8k7rthjX3PLNdwRPq",
    text: "review 1 for cs 2112",
    difficulty: 5,
    class: "oH37S3mJ4eAsdsdpy",
    visible: 1,
    reported: 0,
    user: "nje",
    likedBy: [],
    date: new Date(),
  },
  {
    _id: "4Y8k7rthjX3PLNdwjhgfuytRPq",
    text: "review 1 for math 3110",
    difficulty: 5,
    class: "fhgweiufhwu23",
    visible: 1,
    reported: 0,
    user: "nje",
    likedBy: [],
    date: new Date(),
  },
];

const testSubjects: Subject[] = [
  {
    _id: "cs57687980g",
    subShort: "cs",
    subFull: "Computer Science",
  },
  {
    _id: "math234jhgheyr389",
    subShort: "math",
    subFull: "Mathematics",
  },
];

const validTokenPayload: TokenPayload = {
  email: "dti1@cornell.edu",
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
  hd: "cornell.edu",
};

const testStudents: Student[] = [
  {
    _id: "Irrelevant2",
    firstName: "Dan Thomas",
    lastName: "Ivy",
    netId: "dti1",
    affiliation: null,
    token: "fakeTokenDti1",
    privilege: "admin",
    reviews: [],
    likedReviews: [],
  },
];

const mockVerificationTicket = jest
  .spyOn(Auth, "getVerificationTicket")
  .mockImplementation(async (token: string) => validTokenPayload);

beforeAll(async () => {
  await testServer.setUpDB(
    testReviews,
    testStudents,
    testClasses,
    undefined,
    testSubjects,
  );
});

afterAll(async () => {
  mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});

describe("tests", () => {
  it("topSubjects", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/topSubjects`,
      { token: "token" },
    );
    const match = [
      ["Computer Science", 3],
      ["Mathematics", 1],
    ];

    match.forEach((obj) => {
      expect(res.data.result).toContainEqual(obj);
    });
  });

  it("totalReviews", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/totalReviews`,
      { token: "token" },
    );
    expect(res.data.result).toBe(testReviews.length);
  });

  it("howManyReviewsEachClass", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/howManyReviewsEachClass`,
      { token: "token" },
    );
    const match = [
      { _id: "cs 2110", total: 2 },
      { _id: "cs 2112", total: 1 },
      { _id: "math 3110", total: 1 },
    ];
    match.forEach((obj) => {
      expect(res.data.result).toContainEqual(obj);
    });
  });

  it("howManyEachClass", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/howManyEachClass`,
      { token: "token" },
    );
    const match = [
      { _id: "cs", total: 2 },
      { _id: "math", total: 1 },
    ];
    match.forEach((obj) => {
      expect(res.data.result).toContainEqual(obj);
    });
  });

  it("getReviewsOverTimeTop15", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/getReviewsOverTimeTop15`,
      { token: "token", step: 12, range: 12 },
    );

    expect(res.data.result.math.length).toBeGreaterThan(0);
    expect(res.data.result.cs.length).toBeGreaterThan(0);
  });
});

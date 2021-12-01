
/* eslint-disable import/prefer-default-export */
import mongoose from 'mongoose';

import axios from 'axios';
import { TokenPayload } from 'google-auth-library';

import { Review, Student, Class, Subject, Professor } from 'common';
import * as Auth from "./Auth";

import TestingServer, { testingPort } from './TestServer';

const testServer = new TestingServer(testingPort);

const testClasses: Class[] = [
  {
    _id: "oH37S3mJ4eAsktypy",
    classSub: "cs",
    classNum: "2110",
    classTitle: "Object-Oriented Programming and Data Structures",
    classPrereq: [],
    classFull: "cs 2110 object-oriented programming and data structures",
    classSems: ["FA14", "SP15", "SU15", "FA15", "SP16", "SU16", "FA16", "SP17",
      "SU17", "FA17", "SP18", "FA18", "SU18", "SP19", "FA19", "SU19"],
    crossList: ["q75SxmqkTFEfaJwZ3"],
    classProfessors: ["David Gries", "Douglas James", "Siddhartha Chaudhuri",
      "Graeme Bailey", "John Foster", "Ross Tate", "Michael George",
      "Eleanor Birrell", "Adrian Sampson", "Natacha Crooks", "Anne Bracy",
      "Michael Clarkson"],
    classDifficulty: 2.9,
    classRating: null,
    classWorkload: 3,
  },
];

const testReviews: Review[] = [
  {
    _id: "4Y8k7DnX3PLNdwRPr",
    text: "review text for cs 2110",
    user: "User1234",
    difficulty: 1,
    class: "oH37S3mJ4eAsktypy",
    date: new Date(),
    visible: 1,
    reported: 0,
    likes: 2,
    likedBy: [],
  },
  {
    _id: "4Y8k7DnX3PLNdwRPq",
    text: "review text for cs 2110 number 2",
    user: "User1234",
    difficulty: 1,
    class: "oH37S3mJ4eAsktypy",
    date: new Date(),
    visible: 1,
    reported: 0,
    likes: 0,
    likedBy: [],
  },
  {
    _id: "3yMwTbiyd4MZLPQJF",
    text: "review text for cs 3110",
    user: "User1234",
    difficulty: 3,
    class: "cJSmM8bnwm2QFnmAn",
    date: new Date(),
    visible: 1,
    reported: 0,
    likes: 5,
    likedBy: [],
  },
  {
    _id: "52x7j6tkXHxvrZizx",
    text: "review text for cs 3110 - 2",
    user: "User1234",
    difficulty: 3,
    class: "cJSmM8bnwm2QFnmAn",
    date: new Date(),
    visible: 1,
    reported: 0,
    likes: 5,
    likedBy: [],
  },
];

const testUsers: Student[] = [
  {
    _id: "Irrelevant",
    firstName: "Cornellius",
    lastName: "Vanderbilt",
    netId: "cv4620",
    affiliation: null,
    token: "fakeTokencv4620",
    privilege: "regular",
    reviews: ["4Y8k7DnX3PLNdwRPr", "4Y8k7DnX3PLNdwRPq", "3yMwTbiyd4MZLPQJF"],
    likedReviews: [],
  },
  {
    _id: "bleh",
    firstName: "whatever",
    lastName: "ok",
    netId: "dhs234",
    affiliation: null,
    token: "fakeTokencv4620",
    privilege: "regular",
    reviews: [],
    likedReviews: [],
  },
  {
    _id: "test1",
    firstName: "test",
    lastName: "test",
    netId: "hu33",
    affiliation: null,
    token: "fakeTokencv4620",
    privilege: "regular",
    reviews: null,
    likedReviews: [],
  },
];

beforeAll(async () => {
  await testServer.setUpDB(testReviews, testUsers, testClasses, undefined, undefined);
});

const testGetTotalLikes = 7;
const testGetReviews1 = [{
  _id: "4Y8k7DnX3PLNdwRPr",
  text: "review text for cs 2110",
  user: "User1234",
  difficulty: 1,
  class: "oH37S3mJ4eAsktypy",
  date: new Date(),
  visible: 1,
  reported: 0,
  likes: 2,
  likedBy: [],
},
{
  _id: "4Y8k7DnX3PLNdwRPq",
  text: "review text for cs 2110 number 2",
  user: "User1234",
  difficulty: 1,
  class: "oH37S3mJ4eAsktypy",
  date: new Date(),
  visible: 1,
  reported: 0,
  likes: 0,
  likedBy: [],
},
{
  _id: "3yMwTbiyd4MZLPQJF",
  text: "review text for cs 3110",
  user: "User1234",
  difficulty: 3,
  class: "cJSmM8bnwm2QFnmAn",
  date: new Date(),
  visible: 1,
  reported: 0,
  likes: 5,
  likedBy: [],
}];

const validTokenPayload: TokenPayload = {
  email: 'dti1@cornell.edu',
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
  hd: "cornell.edu",
};

const mockVerificationTicket = jest.spyOn(Auth, 'getVerificationTicket')
  .mockImplementation(async (token?: string) => validTokenPayload);

afterAll(async () => {
  await mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});

describe("tests", () => {
  it("countReviewsByStudentId - counting reviews made by a particular student with netid cv4620", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/countReviewsByStudentId`,
      { netId: "cv4620" },
    );
    expect(res.data.result.message).toBe(testUsers[0].reviews.length);
    expect(res.data.result.code).toBe(200);
  });
  it("countReviewsByStudentId - counting reviews made by a particular student with netid dhs234", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/countReviewsByStudentId`,
      { netId: "dhs234" },
    );
    expect(res.data.result.message).toBe(testUsers[1].reviews.length);
    expect(res.data.result.code).toBe(200);
  });
  it("countReviewsByStudentId - counting reviews made by a particular student with netid hu33", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/v2/countReviewsByStudentId`,
      { netId: "hu33" },
    );
    expect(res.data.result.message).toBe("No reviews object were associated.");
    expect(res.data.result.code).toBe(500);
  });
  it('getTotalLikesByStudentId - counting the number of likes a student got on their reviews', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/getTotalLikesByStudentId`,
      { netId: "cv4620" });
    expect(res.data.result.message).toBe(testGetTotalLikes);
    expect(res.data.result.code).toBe(200);
  });
  it('getReviewsByStudentId - returning a review object list that a student wrote', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/getReviewsByStudentId`,
      { netId: "cv4620" });
    expect(res.data.result.message.length).toBe(testGetReviews1.length);
    expect(res.data.result.code).toBe(200);
  });
});

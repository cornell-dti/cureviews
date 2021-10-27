import axios from 'axios';
import { TokenPayload } from 'google-auth-library';

import { Review, Student } from 'common';
import * as Auth from "./Auth";

import TestingServer, { testingPort } from './TestServer';

const testServer = new TestingServer(testingPort);

const testReviews: Review[] = [
  {
    _id: "4Y8k7DnX3PLNdwRPr",
    text: "review text for cs 2110",
    user: "Irrelevant",
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
    user: "Irrelevant",
    difficulty: 1,
    class: "oH37S3mJ4eAsktypy",
    date: new Date(),
    visible: 1,
    reported: 0,
    likedBy: [],
  },
];

const testUsers: Student[] = [{
  _id: "Irrelevant",
  firstName: "Cornellius",
  lastName: "Vanderbilt",
  netId: "cv4620",
  affiliation: null,
  token: "fakeTokencv4620",
  privilege: "regular",
  reviews: ["4Y8k7DnX3PLNdwRPr", "4Y8k7DnX3PLNdwRPq"],
  likedReviews: [],
},
{ _id: "bleh",
  firstName: "whatever",
  lastName: "ok",
  netId: "dhs234",
  affiliation: null,
  token: "fakeTokencv4620",
  privilege: "regular",
  reviews: [],
  likedReviews: [],
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

beforeAll(async () => {
  // get mongoose all set up
  await testServer.setUpDB(testReviews, testUsers, undefined, undefined, undefined);
});

afterAll(async () => {
  await mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});

describe('tests', () => {
  it('countReviewsByStudentId - counting reviews made by a particular student with netid cv4620', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/countReviewsByStudentId`, { netId: "cv4620" });
    expect(res.data.result).toBe(testUsers[0].reviews.length);
  });
  it('countReviewsByStudentId - counting reviews made by a particular student with netid dhs234', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/countReviewsByStudentId`, { netId: "dhs234" });
    expect(res.data.result).toBe(testUsers[1].reviews.length);
  });
});

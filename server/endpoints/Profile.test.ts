/* eslint-disable import/prefer-default-export */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from "express";

import axios from 'axios';
import { TokenPayload } from 'google-auth-library';

import { Review, Student, Class, Subject, Professor } from 'common';
import { configure } from "../endpoints";
import { Classes, Reviews, Students } from "../dbDefs";
import * as Auth from "./Auth";

import TestingServer, { testingPort } from './TestServer';

const testServer = new TestingServer(testingPort);

beforeAll(async () => {
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

  const testStudents: Student[] = [
    {
      _id: "Irrelevant",
      firstName: "John",
      lastName: "Smith",
      netId: "js0",
      affiliation: null,
      token: null,
      privilege: "regular",
      reviews: ["4Y8k7DnX3PLNdwRPr", "2hsb388HzRZMTyfkp", "3yMwTbiyd4MZLPQJF"],
      likedReviews: [],
    },
  ];

  // inital reviews that are present at start of all tests.
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
      _id: "2hsb388HzRZMTyfkp",
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

  await testServer.setUpDB(testReviews, testStudents, testClasses, undefined, undefined);
});

const testTotalLikes = 7;

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
  mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});


describe('tests', () => {
  it('getTotalLikesByStudentId - counting the number of likes a student got on their reviews', async () => {
    const res = await axios.post(`http://localhost:${testingPort}/v2/getTotalLikesByStudentId`, { netId: "js0" });
    expect(res.data.result.totalLikes).toBe(testTotalLikes);
  });
});

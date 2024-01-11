/* eslint-disable import/prefer-default-export */
import axios from 'axios';

import { testClasses, testReviews, testStudents } from './mocks/InitMockDb';
import { mockVerificationTicket } from './mocks/MockAuth';

import { testServer, testPort } from './mocks/MockServer';
import { Reviews, Students } from '../db/schema';

beforeAll(async () => {
  await testServer.setUpDB(
    testReviews,
    testStudents,
    testClasses,
    undefined,
    undefined,
  );
});

afterAll(async () => {
  await mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});

describe('tests', () => {
  it('countReviewsByStudentId - counting reviews made by a particular student with netid cv4620', async () => {
    const netId = 'cv4620';
    const res = await axios.post(
      `http://localhost:${testPort}/api/countReviewsByStudentId`,
      { netId },
    );

    const student = await Students.findOne({ netId });
    const studentReviews = await Reviews.find({ user: netId });

    expect(studentReviews.length).toBe(student?.reviews.length);
    expect(res.data.result).toBe(student?.reviews.length);
    expect(res.status).toBe(200);
  });

  it('countReviewsByStudentId - counting reviews made by a particular student with netid hu33', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/countReviewsByStudentId`, {
        netId: 'hu33',
      })
      .catch((e) => e);

    expect(res.response.status).toBe(404);
  });

  it('getTotalLikesByStudentId - counting the number of likes a student got on their reviews', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/getTotalLikesByStudentId`,
      { netId: 'cv4620' },
    );

    const testGetTotalLikes = 7;

    expect(res.data.result).toBe(testGetTotalLikes);
    expect(res.status).toBe(200);
  });

  it('getTotalLikesByStudentId - counting the number of likes of a student that does not exist', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/getTotalLikesByStudentId`, {
        netId: 'myl39',
      })
      .catch((e) => {
        return e;
      });
    expect(res.response.status).toBe(404);
  });

  it('getTotalLikesByStudentId - counting the number of likes of a student that does not have any likes', async () => {
    console.log(await Students.findOne({ netId: 'dhs234' }));

    const res = await axios.post(
      `http://localhost:${testPort}/api/getTotalLikesByStudentId`,
      {
        netId: 'dhs234',
      },
    );

    expect(res.status).toBe(200);
    expect(res.data.result).toBe(0);
  });

  it('getReviewsByStudentId - returning a review object list that a student wrote', async () => {
    const netId = 'cv4620';
    const res = await axios.post(
      `http://localhost:${testPort}/api/getReviewsByStudentId`,
      { netId },
    );
    const student = await Students.findOne({ netId });
    const studentReviews = await Reviews.find({ user: netId });

    expect(studentReviews.length).toBe(student?.reviews.length);
    expect(res.data.result.length).toBe(student?.reviews.length);
    expect(res.status).toBe(200);
  });
});

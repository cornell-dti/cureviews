import { expect, test, describe, beforeAll, afterAll } from 'vitest';

import axios from 'axios';

import { testClasses, testReviews, testStudents } from './mocks/InitMockDb';

import { testServer, testPort } from './mocks/MockServer';
import { Reviews, Students } from '../db/schema';

beforeAll(async () => {
  await testServer.setUpDB(
    testReviews,
    testStudents,
    testClasses,
    undefined,
    undefined
  );
});

afterAll(async () => {
  // await mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});

describe('Profile functionality unit tests', () => {
  test('Counting reviews made by a particular student with netid "cv4620"', async () => {
    const netId = 'cv4620';
    const res = await axios.post(
      `http://localhost:${testPort}/api/profiles/count-reviews`,
      { netId }
    );

    const student = await Students.findOne({ netId });
    const studentReviews = await Reviews.find({ user: student?._id });

    expect(studentReviews.length).toBe(student?.reviews.length);
    expect(res.data.result).toBe(student?.reviews.length);
    expect(res.status).toBe(200);
  });

  test('Counting reviews made by a particular student with netid "hu33"', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/profiles/count-reviews`,
      {
        netId: 'hu33'
      }
    );

    expect(res.status).toBe(200);
    expect(res.data.result).toBe(0);
  });

  test('Counting the number of likes that student "cv4620" got on their reviews', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/profiles/get-likes`,
      { netId: 'cv4620' }
    );

    const testGetTotalLikes = 7;

    expect(res.data.result).toBe(testGetTotalLikes);
    expect(res.status).toBe(200);
  });

  test('Counting the number of likes of a student that does not exist', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/profiles/get-likes`, {
        netId: 'myl39'
      })
      .catch((e) => e);
    expect(res.response.status).toBe(404);
  });

  test('Counting the number of likes of a student that does not have any likes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/profiles/get-likes`,
      {
        netId: 'dhs234'
      }
    );

    expect(res.status).toBe(200);
    expect(res.data.result).toBe(0);
  });

  test('Returning a list of Review objects that a student wrote', async () => {
    const netId = 'cv4620';
    const res = await axios.post(
      `http://localhost:${testPort}/api/profiles/get-reviews`,
      { netId }
    );
    const student = await Students.findOne({ netId });
    const studentReviews = await Reviews.find({ user: student?._id });

    expect(studentReviews.length).toBe(student?.reviews.length);
    expect(res.data.result.length).toBe(student?.reviews.length);
    expect(res.status).toBe(200);
  });
});

import { expect, test, describe, beforeAll, afterAll } from 'vitest';

import axios from 'axios';

import { testClasses, testReviews } from './mocks/InitMockDb';
import { testPort, testServer } from './mocks/MockServer';
import { Reviews } from '../db/schema';

beforeAll(async () => {
  // get mongoose all set up
  await testServer.setUpDB(
    testReviews,
    undefined,
    testClasses,
    undefined,
    undefined
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
});

describe('Course functionality unit tests', () => {
  test('Getting review of course that exists', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/courses/get-reviews`,
      { courseId: 'oH37S3mJ4eAsktypy' }
    );

    const reviews = await Reviews.find({
      class: 'oH37S3mJ4eAsktypy',
      reported: 0,
      visible: 1
    });
    expect(res.data.result.length).toBe(reviews.length);

    const classOfReviews = reviews.map((r) => r.class);
    expect(res.data.result.map((r) => r.class).sort()).toEqual(
      classOfReviews.sort()
    );
  });

  test('Getting review for a class that does not exist', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/courses/get-reviews`, {
        courseId: 'ert'
      })
      .catch((e) => e);
    expect(res.response.status).toEqual(404);
  });

  test('Getting course by ID', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/courses/get-by-id`,
      { courseId: 'oH37S3mJ4eAsktypy' }
    );

    expect(res.status).toBe(200);
    expect(res.data.result._id).toBe('oH37S3mJ4eAsktypy');
    expect(res.data.result.classTitle).toBe(
      'Object-Oriented Programming and Data Structures'
    );
  });

  test('Getting course by ID - course does not exist', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/courses/get-by-id`,
      { courseId: 'blah' }
    );
    expect(res.data.result).toBe(null);
  });

  test('Getting course by info', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/courses/get-by-info`,
      { subject: 'cs', number: '2110' }
    );
    expect(res.data.result._id).toBe('oH37S3mJ4eAsktypy');
    expect(res.data.result.classTitle).toBe(
      'Object-Oriented Programming and Data Structures'
    );
  });

  test('Getting course by info - demonstrate regex irrelevance', async () => {
    // Will not accept non-numeric:
    const res1 = await axios
      .post(`http://localhost:${testPort}/api/courses/get-by-info`, {
        subject: 'Vainamoinen',
        number: 'ab2187c'
      })
      .catch((e) => e);
    expect(res1.response.status).toBe(404);

    // Will not accept non-ascii:
    const res2 = await axios
      .post(`http://localhost:${testPort}/api/courses/get-by-info`, {
        subject: '向岛维纳默宁',
        number: '1234'
      })
      .catch((e) => e);
    expect(res2.response.status).toBe(404);

    // Both also does not work:
    const res3 = await axios
      .post(`http://localhost:${testPort}/api/courses/get-by-info`, {
        subject: '向岛维纳默宁',
        number: 'ab2187c'
      })
      .catch((e) => e);
    expect(res3.response.status).toBe(404);
  });

  test('Getting reviews by course ID - user IDs are not leaked by querying reviews', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/courses/get-reviews`, {
        courseId: 'oH37S3mJ4eAsktypy'
      })
      .catch((e) => e);

    const reviews = await Reviews.find({
      class: 'oH37S3mJ4eAsktypy',
      reported: 0,
      visible: 1
    });

    expect(res.data.result.length).toBe(reviews.length);

    const classOfReviews = reviews.map((r) => r.user);
    expect(res.data.result.map((r) => r.user).sort()).not.toEqual(
      classOfReviews.sort()
    );
    expect(res.data.result.map((r) => r.user).sort()).toEqual(
      classOfReviews.map((r) => '')
    );
  });
});

import axios from 'axios';

import TestingServer from './TestServer';
import { testClasses, testReviews } from './mocks/InitMockDb';
import { validTokenPayload } from './mocks/MockAuth';

import { Auth } from '../src/auth/auth';

const testingPort = 8080;
const testServer = new TestingServer(testingPort);

beforeAll(async () => {
  // get mongoose all set up
  await testServer.setUpDB(
    testReviews,
    undefined,
    testClasses,
    undefined,
    undefined,
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
});

describe('course functionality unit tests', () => {
  it('getReviewsByCourseId - getting review of class that exists (cs 2110)', async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/api/getReviewsByCourseId`,
      { courseId: 'oH37S3mJ4eAsktypy' },
    );
    expect(res.data.result.length).toBe(testReviews.length);

    const classOfReviews = testReviews.map((r) => r.class);
    expect(res.data.result.map((r) => r.class).sort()).toEqual(
      classOfReviews.sort(),
    );
  });

  it('getReviewsByCourseId - getting review for a class that does not exist', async () => {
    const res = await axios
      .post(`http://localhost:${testingPort}/api/getReviewsByCourseId`, {
        courseId: 'ert',
      })
      .catch((e) => e);
    expect(res.response.status).toEqual(404);
  });

  it('getCourseById - getting cs2110', async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/api/getCourseById`,
      { courseId: 'oH37S3mJ4eAsktypy' },
    );

    expect(res.status).toBe(200);
    expect(res.data.result._id).toBe('oH37S3mJ4eAsktypy');
    expect(res.data.result.classTitle).toBe(
      'Object-Oriented Programming and Data Structures',
    );
  });

  it('getCourseById - class does not exist', async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/api/getCourseById`,
      { courseId: 'blah' },
    );
    expect(res.data.result).toBe(null);
  });

  it('getCourseByInfo - getting cs2110', async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/api/getCourseByInfo`,
      { subject: 'cs', number: '2110' },
    );
    expect(res.data.result._id).toBe('oH37S3mJ4eAsktypy');
    expect(res.data.result.classTitle).toBe(
      'Object-Oriented Programming and Data Structures',
    );
  });

  it('getCourseByInfo - demonstrate regex irrelevance', async () => {
    // Will not accept non-numeric:
    const res1 = await axios
      .post(`http://localhost:${testingPort}/api/getCourseByInfo`, {
        subject: 'Vainamoinen',
        number: 'ab2187c',
      })
      .catch((e) => e);
    expect(res1.response.status).toBe(404);

    // Will not accept non-ascii:
    const res2 = await axios
      .post(`http://localhost:${testingPort}/api/getCourseByInfo`, {
        subject: '向岛维纳默宁',
        number: '1234',
      })
      .catch((e) => e);
    expect(res2.response.status).toBe(404);

    // Both also does not work:
    const res3 = await axios
      .post(`http://localhost:${testingPort}/api/getCourseByInfo`, {
        subject: '向岛维纳默宁',
        number: 'ab2187c',
      })
      .catch((e) => e);
    expect(res3.response.status).toBe(404);
  });
});

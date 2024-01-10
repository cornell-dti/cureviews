/* eslint-disable import/prefer-default-export */
import axios from 'axios';

import { Reviews, Students } from '../db/schema';
import TestingServer from './TestServer';
import { testClasses } from './mocks/MockClasses';
import { validTokenPayload } from './mocks/MockAuth';
import { testReviews } from './mocks/MockReviews';

import { Auth } from '../src/auth/auth';
import { Review } from 'common';

const testingPort = 8080;
const testServer = new TestingServer(testingPort);

const auth = new Auth({ token: '' });

const mockVerificationTicket = jest
  .spyOn(auth, 'getVerificationTicket')
  .mockImplementation(async () => {
    return validTokenPayload;
  });

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
  await mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});

describe('tests', () => {
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
    const res = await axios.post(
      `http://localhost:${testingPort}/api/getReviewsByCourseId`,
      { courseId: 'ert' },
    );
    expect(res.status).toEqual(404);
  });

  it('getCourseById - getting cs2110', async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/api/getCourseById`,
      { courseId: 'oH37S3mJ4eAsktypy' },
    );
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
    expect(res1.message).toBe('Request failed with status code 400');

    // Will not accept non-ascii:
    const res2 = await axios
      .post(`http://localhost:${testingPort}/api/getCourseByInfo`, {
        subject: '向岛维纳默宁',
        number: '1234',
      })
      .catch((e) => e);
    expect(res2.message).toBe('Request failed with status code 400');

    // Both also does not work:
    const res3 = await axios
      .post(`http://localhost:${testingPort}/api/getCourseByInfo`, {
        subject: '向岛维纳默宁',
        number: 'ab2187c',
      })
      .catch((e) => e);
    expect(res3.message).toBe('Request failed with status code 400');
  });

  it('insert Review', async () => {
    const cs2110Id = 'oH37S3mJ4eAsktypy';

    const reviewToInsert: Review = {
      _id: 'blah',
      user: 'dhsn',
      workload: 3,
      professors: ['prof1'],
      isCovid: false,
      text: 'sample inserted review for cs 2110. dfghjd76',
      difficulty: 1,
      likedBy: [],
      rating: 4,
    };

    const res = await axios.post(
      `http://localhost:${testingPort}/api/insertReview`,
      { courseId: cs2110Id, review: reviewToInsert, token: 'fakeTokenDti1' },
    );
    expect(res.data.result.resCode).toBe(1);
    const reviews = await Reviews.find({ text: reviewToInsert.text }).exec();
    expect(reviews.length).toBe(1);

    const dtiUser = await Students.findOne({ netId: 'dti1' });
    const review = reviews[0];
    // Was the user logged correctly as the creator of the review?
    expect(review.user).toBe(dtiUser?._id);
    // Has the review been added to the creator?
    expect(dtiUser?.reviews).toContain(review._id);
  });

  it('like/dislike - increment and decrement', async () => {
    const res1 = await axios.post(
      `http://localhost:${testingPort}/api/updateLiked`,
      { id: '4Y8k7DnX3PLNdwRPr', token: 'fakeTokenDti1' },
    );

    expect(res1.status).toBe(200);
    const reviewLiked = await Reviews.findOne({ _id: '4Y8k7DnX3PLNdwRPr' });
    expect(reviewLiked?.likes).toBe(3);

    const res2 = await axios.post(
      `http://localhost:${testingPort}/api/updateLiked`,
      { id: '4Y8k7DnX3PLNdwRPr', token: 'fakeTokenDti1' },
    );

    const reviewDisliked = await Reviews.findOne({ _id: '4Y8k7DnX3PLNdwRPr' });
    expect(res2.status).toBe(200);
    expect(reviewDisliked?.likes).toBe(2);
  });

  it('insert User', async () => {
    const user1 = {
      _id: 'Irrelevant',
      firstName: 'Cornellius',
      lastName: 'Vanderbilt',
      netId: 'cv4620',
      affiliation: null,
      token: 'fakeTokencv4620',
      privilege: 'regular',
    };

    const gObj1 = {
      email: 'cv4620@cornell.edu',
      // This is the google people, not us. It has to be this way:
      // https://googleapis.dev/nodejs/google-auth-library/latest/interfaces/TokenPayload.html
      // eslint-disable-next-line @typescript-eslint/camelcase
      given_name: user1.firstName,
      // eslint-disable-next-line  @typescript-eslint/camelcase
      family_name: user1.lastName,
    };

    const res = await axios.post(
      `http://localhost:${testingPort}/api/insertUser`,
      { googleObject: gObj1 },
    );
    expect(res.data.result).toBe(1);
    expect(
      (await Students.find({}).exec()).filter((s) => s.netId === 'cv4620')
        .length,
    ).toBe(1);
  });

  it("user id's not being leaked by querying reviews", async () => {
    const res = await axios.post(
      `http://localhost:${testingPort}/api/getReviewsByCourseId`,
      { courseId: 'oH37S3mJ4eAsktypy' },
    );
    expect(res.data.result.length).toBe(testReviews.length);

    const classOfReviews = testReviews.map((r) => r.user);
    expect(res.data.result.map((r) => r.user).sort()).not.toEqual(
      classOfReviews.sort(),
    );
    expect(res.data.result.map((r) => r.user).sort()).toEqual(['', '']);
  });
});

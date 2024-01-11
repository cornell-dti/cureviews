/* eslint-disable import/prefer-default-export */
import axios from 'axios';

import { Reviews, Students } from '../db/schema';
import { testClasses, testReviews, testStudents } from './mocks/InitMockDb';
import { testServer, testPort } from './mocks/MockServer';
import { validTokenPayload } from './mocks/MockAuth';

import { Auth } from '../src/auth/auth';
import { Review } from 'common';

const mockVerificationTicket = jest
  .spyOn(Auth.prototype, 'getVerificationTicket')
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
  // await mockVerifyToken.mockRestore();
  await mockVerificationTicket.mockRestore();
  await testServer.shutdownTestingServer();
});

describe('review functionality unit tests', () => {
  it('insertReview - working functionality', async () => {
    const reviewToInsert: Review = {
      _id: 'blah',
      user: 'Irrelevant2',
      workload: 3,
      professors: ['prof1'],
      isCovid: false,
      text: 'sample inserted review for cs 2110. dfghjd76',
      difficulty: 1,
      likedBy: [],
      rating: 4,
    };

    const res = await axios.post(
      `http://localhost:${testPort}/api/insertReview`,
      {
        courseId: 'oH37S3mJ4eAsktypy',
        review: reviewToInsert,
        token: 'testToken',
      },
    );
    expect(res.status).toBe(200);

    const review = await Reviews.findOne({ text: reviewToInsert.text }).exec();

    const dtiUser = await Students.findOne({ netId: 'dti1' });
    // Was the user logged correctly as the creator of the review?
    expect(review?.user).toBe(dtiUser?._id);
    // Has the review been added to the creator?
    expect(dtiUser?.reviews).toContain(review?._id);
  });

  it('like/dislike - increment and decrement', async () => {
    const res1 = await axios.post(
      `http://localhost:${testPort}/api/updateLiked`,
      { id: '4Y8k7DnX3PLNdwRPr', token: 'testToken' },
    );

    expect(res1.status).toBe(200);
    const reviewLiked = await Reviews.findOne({ _id: '4Y8k7DnX3PLNdwRPr' });
    expect(reviewLiked?.likes).toBe(3);

    const res2 = await axios.post(
      `http://localhost:${testPort}/api/updateLiked`,
      { id: '4Y8k7DnX3PLNdwRPr', token: 'testToken' },
    );

    const reviewDisliked = await Reviews.findOne({ _id: '4Y8k7DnX3PLNdwRPr' });
    expect(res2.status).toBe(200);
    expect(reviewDisliked?.likes).toBe(2);
  });

  // it('insertUser', async () => {
  //   const user1 = {
  //     _id: 'Irrelevant',
  //     firstName: 'Cornellius',
  //     lastName: 'Vanderbilt',
  //     netId: 'cv4620',
  //     affiliation: null,
  //     token: 'fakeTokencv4620',
  //     privilege: 'regular',
  //   };

  //   const gObj1 = {
  //     email: 'cv4620@cornell.edu',
  //     // This is the google people, not us. It has to be this way:
  //     // https://googleapis.dev/nodejs/google-auth-library/latest/interfaces/TokenPayload.html
  //     // eslint-disable-next-line @typescript-eslint/camelcase
  //     given_name: user1.firstName,
  //     // eslint-disable-next-line  @typescript-eslint/camelcase
  //     family_name: user1.lastName,
  //   };

  //   const res = await axios.post(
  //     `http://localhost:${testPort}/api/insertUser`,
  //     { googleObject: gObj1 },
  //   );
  //   expect(res.data.result).toBe(1);
  //   expect(
  //     (await Students.find({}).exec()).filter((s) => s.netId === 'cv4620')
  //       .length,
  //   ).toBe(1);
  // });
});

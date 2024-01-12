import axios from 'axios';

import { Reviews } from '../db/schema';
import { testServer, testPort } from './mocks/MockServer';
import * as AdminAuth from '../src/admin/admin.controller';
import { testClasses, testReviews } from './mocks/InitMockDb';

const mockVerification = jest
  .spyOn(AdminAuth, 'verifyTokenAdmin')
  .mockImplementation(async ({ auth }) => true);

beforeAll(async () => {
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
  mockVerification.mockRestore();
});

describe('admin functionality unit tests', () => {
  it('fetchPendingReviews-works', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/fetchPendingReviews`,
      { token: 'non-empty' },
    );
    const ids = res.data.result.map((i) => i._id);
    const reviewsPending = await Reviews.findOne({ visible: 0 }).map(
      (review) => review?._id,
    );

    expect(ids.includes(reviewsPending)).toBeTruthy();
  });

  it('makeReviewVisible - will not make review that has been reported visible', async () => {
    const pendingReportedReview = await Reviews.findOne({
      visible: 0,
      reported: 1,
    });

    const res = await axios
      .post(`http://localhost:${testPort}/api/makeReviewVisible`, {
        review: pendingReportedReview,
        token: 'non-empty',
      })
      .catch((e) => e);

    expect(res.response.status).toEqual(400);
  });

  it('makeReviewVisible-works', async () => {
    const pendingReview = await Reviews.findOne({ visible: 0, reported: 0 });

    const res = await axios.post(
      `http://localhost:${testPort}/api/makeReviewVisible`,
      { review: pendingReview, token: 'non-empty' },
    );

    expect(res.status).toEqual(200);
    const review = await Reviews.findOne({ _id: pendingReview?._id });
    expect(review?.visible).toEqual(1);
  });

  it('undoReportReview-works', async () => {
    const reportedReview = await Reviews.findOne({ visible: 0, reported: 1 });
    const res = await axios.post(
      `http://localhost:${testPort}/api/undoReportReview`,
      {
        review: reportedReview,
        token: 'non empty',
      },
    );

    expect(res.status).toEqual(200);
    const reviewFromDb = await Reviews.findById(reportedReview?._id).exec();
    expect(reviewFromDb?.visible).toEqual(1);
    expect(reviewFromDb?.reported).toEqual(0);
  });

  it('removeReview-works', async () => {
    const reportedReview = await Reviews.findOne({ visible: 0, reported: 1 });

    const res = await axios
      .post(`http://localhost:${testPort}/api/removeReview`, {
        review: reportedReview,
        token: 'non empty',
      })
      .catch((e) => {
        console.log(e);
        return e;
      });
    expect(res.status).toEqual(200);
    const review = await Reviews.findById(reportedReview?._id);
    expect(review).toEqual(null);
  });
});

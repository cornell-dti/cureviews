/* eslint-disable operator-linebreak */
import axios from 'axios';

import { Classes, Reviews } from '../db/schema';
import { testServer, testPort } from './mocks/MockServer';
import * as AdminAuth from '../src/admin/admin.controller';
import { testClasses, testReviews } from './mocks/InitMockDb';

const mockVerification = jest
  .spyOn(AdminAuth, 'verifyTokenAdmin')
  .mockImplementation(async ({ auth }) => true);

const getReviewDifficultyMetric = async (review) => {
  const reviews = await Reviews.find({
    class: review?.class,
    visible: 1,
    reported: 0,
  });

  let totalSum = 0;
  reviews.map((r) => {
    totalSum += r.difficulty ? r.difficulty : 0;
    return totalSum;
  });

  const avg = reviews.length !== 0 ? totalSum / reviews.length : null;
  return avg;
};

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

    const reviewClass = await Classes.findById(pendingReview?.class);
    const avg = await getReviewDifficultyMetric(pendingReview);
    expect(reviewClass?.classDifficulty).toEqual(avg);
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

    const reviewClass = await Classes.findById(reportedReview?.class);
    const avg = await getReviewDifficultyMetric(reportedReview);
    expect(reviewClass?.classDifficulty).toEqual(avg);
  });

  it('removeReview-works', async () => {
    const reportedReview = await Reviews.findOne({ visible: 0, reported: 1 });

    const res = await axios
      .post(`http://localhost:${testPort}/api/removeReview`, {
        review: reportedReview,
        token: 'non empty',
      })
      .catch((e) => e);
    expect(res.status).toEqual(200);
    const review = await Reviews.findById(reportedReview?._id);
    expect(review).toEqual(null);

    const reviewClass = await Classes.findById(reportedReview?.class);
    const avg = await getReviewDifficultyMetric(reportedReview);
    expect(reviewClass?.classDifficulty).toEqual(avg);
  });
});

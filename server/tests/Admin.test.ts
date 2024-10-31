import { expect, test, describe, vi } from 'vitest'
import { beforeAll, afterAll } from 'vitest'

import axios from 'axios';

import { Classes, Reviews } from '../db/schema';
import * as AdminAuth from '../src/admin/admin.controller';
import { Auth } from "../src/auth/auth";

import { testServer, testPort } from './mocks/MockServer';
import { mockVerificationTicket } from "./mocks/MockAuth";
import { testClasses, testStudents, testReviews } from './mocks/InitMockDb';

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
    testStudents,
    testClasses,
    undefined,
    undefined,
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
  await mockVerificationTicket.mockRestore();
});

describe('Admin functionality unit tests', () => {
  test('Fetching pending reviews works', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/admin/reviews/get-pending`,
      { token: 'fakeTokenDti1' },
    );
    const ids = res.data.result.map((i) => i._id);
    const pendingReview = await Reviews.findOne({ visible: 0, reported: 0 })
    const pendingId = pendingReview?._id

    expect(ids.includes(pendingId)).toBeTruthy();
  });

  test('Make review visible will not make a reported review visible', async () => {
    const pendingReportedReview = await Reviews.findOne({
      visible: 0,
      reported: 1,
    });

    const res = await axios
      .post(`http://localhost:${testPort}/api/admin/reviews/approve`, {
        review: pendingReportedReview,
        token: 'fakeTokenDti1',
      })
      .catch((e) => e);

    expect(res.response.status).toEqual(400);
  });

  test('Approving a review works correctly', async () => {
    const pendingReview = await Reviews.findOne({ visible: 0, reported: 0 });

    const res = await axios.post(
      `http://localhost:${testPort}/api/admin/reviews/approve`,
      { review: pendingReview, token: 'non-empty' },
    );

    expect(res.status).toEqual(200);
    const review = await Reviews.findOne({ _id: pendingReview?._id });
    expect(review?.visible).toEqual(1);

    const reviewClass = await Classes.findById(pendingReview?.class);
    const avg = await getReviewDifficultyMetric(pendingReview);
    expect(reviewClass?.classDifficulty).toEqual(avg);
  });

  test('Restoring a review (undoing a report) works correctly', async () => {
    const reportedReview = await Reviews.findOne({ visible: 0, reported: 1 });

    const res = await axios.post(
      `http://localhost:${testPort}/api/admin/reviews/restore`,
      {
        review: reportedReview,
        token: 'fakeTokenDti1',
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

  test('Removing a review works correctly', async () => {
    const reportedReview = await Reviews.findOne({ visible: 0, reported: 1 });

    const res = await axios
      .post(`http://localhost:${testPort}/api/admin/reviews/remove`, {
        review: reportedReview,
        token: 'fakeTokenDti1',
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

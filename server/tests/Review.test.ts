/* eslint-disable import/prefer-default-export */
import axios from "axios";

import { Review } from "common";
import { Reviews, Students } from "../db/schema";
import { testClasses, testReviews } from "./mocks/InitMockDb";
import { testServer, testPort } from "./mocks/MockServer";
import { mockVerificationTicket, getValidTokenMock } from "./mocks/MockAuth";

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
  await getValidTokenMock.mockRestore();
  await testServer.shutdownTestingServer();
});

describe("review functionality unit tests", () => {
  it("insertReview - working functionality", async () => {
    const reviewToInsert: Review = {
      _id: "blah",
      user: "Irrelevant2",
      workload: 3,
      professors: ["prof1"],
      isCovid: false,
      text: "sample inserted review for cs 2110. dfghjd76",
      difficulty: 1,
      likedBy: [],
      rating: 4,
    };

    const res = await axios.post(
      `http://localhost:${testPort}/api/reviews/post`,
      {
        courseId: "oH37S3mJ4eAsktypy",
        review: reviewToInsert,
        token: "fakeTokenDti1",
      },
    );
    expect(res.status).toBe(200);

    const review = await Reviews.findOne({ text: reviewToInsert.text }).exec();
    const dtiUser = await Students.findOne({ netId: "dti1" });

    // Was the user logged correctly as the creator of the review?
    expect(review?.user).toBe(dtiUser?._id);
    // Has the review been added to the creator?
    expect(dtiUser?.reviews).toContain(review?._id);
  });

  it("like/dislike - increment and decrement", async () => {
    const res1 = await axios.post(
      `http://localhost:${testPort}/api/reviews/update-liked`,
      { id: "4Y8k7DnX3PLNdwRPr", token: "fakeTokenDti1" },
    );

    expect(res1.status).toBe(200);
    const reviewLiked = await Reviews.findOne({ _id: "4Y8k7DnX3PLNdwRPr" });
    expect(reviewLiked?.likes).toBe(3);

    const res2 = await axios.post(
      `http://localhost:${testPort}/api/reviews/update-liked`,
      { id: "4Y8k7DnX3PLNdwRPr", token: "fakeTokenDti1" },
    );

    const reviewDisliked = await Reviews.findOne({ _id: "4Y8k7DnX3PLNdwRPr" });
    expect(res2.status).toBe(200);
    expect(reviewDisliked?.likes).toBe(2);
  });

  it("reportReview - works", async () => {
    const res1 = await axios.post(
      `http://localhost:${testPort}/api/admin/reviews/report`,
      { id: "4Y8k7DnX3PLNdwRPr", token: "fakeTokenDti1" },
    );

    expect(res1.status).toBe(200);
    const reviewReported = await Reviews.findOne({ _id: "4Y8k7DnX3PLNdwRPr" });
    expect(reviewReported?.visible).toBe(0);
    expect(reviewReported?.reported).toBe(1);
  });
});

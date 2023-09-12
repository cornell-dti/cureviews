import axios from "axios";
import { TokenPayload } from "google-auth-library/build/src/auth/loginticket";

import { Student } from "common";
import * as Auth from "../auth/routes";
import TestingServer, { testingPort } from "./TestServer";

const testServer = new TestingServer(testingPort);

const invalidTokenPayload: TokenPayload = {
  email: "cv4620@cornell.edu",
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
};

const validTokenPayload: TokenPayload = {
  email: "dti1@cornell.edu",
  iss: undefined,
  sub: undefined,
  iat: undefined,
  aud: undefined,
  exp: undefined,
};

beforeAll(async () => {
  const testStudents: Student[] = [
    // non admin user
    {
      _id: "Irrelevant",
      firstName: "Cornellius",
      lastName: "Vanderbilt",
      netId: "cv4620",
      affiliation: null,
      token: "fakeTokencv4620",
      privilege: "regular",
      reviews: [],
      likedReviews: [],
    },
    // admin user
    {
      _id: "Irrelevant2",
      firstName: "Dan Thomas",
      lastName: "Ivy",
      netId: "dti1",
      affiliation: null,
      token: "fakeTokenDti1",
      privilege: "admin",
      reviews: [],
      likedReviews: [],
    },
  ];
  await testServer.setUpDB(
    undefined,
    testStudents,
    undefined,
    undefined,
    undefined,
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
});

describe("tests", () => {
  it("tokenIsAdmin-works", async () => {
    const mockVerificationTicket = jest
      .spyOn(Auth, "getVerificationTicket")
      .mockImplementation(async (token?: string) => {
        if (token === "fakeTokenDti1") {
          return validTokenPayload;
        }
        return invalidTokenPayload;
      });

    const failRes = await axios.post(
      `http://localhost:${testingPort}/v2/tokenIsAdmin`,
      { token: "fakeTokencv4620" },
    );
    expect(failRes.data.result).toEqual(false);
    const successRes = await axios.post(
      `http://localhost:${testingPort}/v2/tokenIsAdmin`,
      { token: "fakeTokenDti1" },
    );
    expect(successRes.data.result).toEqual(true);

    mockVerificationTicket.mockRestore();
  });
});

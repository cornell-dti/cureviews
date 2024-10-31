import { expect, test, describe, vi } from 'vitest'
import { beforeAll, afterAll } from 'vitest'

import axios from "axios";

import { testPort, testServer } from "./mocks/MockServer";
import { testStudents } from "./mocks/InitMockDb";
import { Students } from "../db/schema";
import { mockVerificationTicket } from "./mocks/MockAuth";
import { Auth } from "../src/auth/auth";

beforeAll(async () => {
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
  await mockVerificationTicket.mockRestore();
});

describe("Auth functionality unit tests", () => {
  test("Insert a user works correctly", async () => {
    const getInvalidTokenMock = vi
      .spyOn(Auth.prototype, "getToken")
      .mockImplementation(() => "fakeTokencv4620");

    const user1 = {
      _id: "Irrelevant",
      firstName: "Cornellius",
      lastName: "Vanderbilt",
      netId: "cv4620",
      affiliation: null,
      token: "fakeTokencv4620",
      privilege: "regular",
    };

    const res = await axios.post(
      `http://localhost:${testPort}/api/auth/new-user`,
      { token: user1.token },
    );
    expect(res.status).toBe(200);
    expect(
      (await Students.find({}).exec()).filter((s) => s.netId === "cv4620")
        .length,
    ).toBe(1);

    getInvalidTokenMock.mockRestore();
  });

  test("tokenIsAdmin works correctly", async () => {
    const getInvalidTokenMock = vi
    .spyOn(Auth.prototype, "getToken")
    .mockImplementation(() => "fakeTokencv4620");

    const failRes = await axios.post(
      `http://localhost:${testPort}/api/admin/token/validate`,
      { token: "fakeTokencv4620" },
    );

    expect(failRes.data.result).toEqual(false);
    await getInvalidTokenMock.mockRestore();

    const getValidTokenMock = vi
      .spyOn(Auth.prototype, "getToken")
      .mockImplementation(() => "fakeTokenDti1");

    const successRes = await axios.post(
      `http://localhost:${testPort}/api/admin/token/validate`,
      { token: "fakeTokenDti1" },
    );

    expect(successRes.data.result).toEqual(true);
    await getValidTokenMock.mockRestore();
  });
});

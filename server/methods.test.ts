import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Classes, Validation, Student, Students } from './dbDefs';
import { Meteor } from './shim';
import './methods.ts'

// May require additional time for downloading 100 mb (!) worth of MongoDB binaries
// *We might not want to run this with CI**
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;

beforeAll(async () => {
  // get mongoose all set up
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('tests', () => {
  // simple test to see if jest works as expected with typescript
  it('jest-async-works', async () => {
    const v : boolean = true;
    expect(v).toBe(true);
  });

  // make sure that our fake mongodb server exists
  it('mongoose-works', async () => {
    // mess with validation because it isn't touched anywhere else
    expect(await Validation.countDocuments({}).exec()).toBe(0);
    expect(await Validation.findOne({}).exec()).toBeNull();
  });

  // test the fact that the meteor shim exists at last one of the methods from methods.ts imported
  // also test "getUserByNetId" while we are at it
  it('meteor-shim-exists', async () => {
    const newUser = new Students({
      _id: "Irrelevant",
      firstName: "John",
      lastName: "Smith",
      netId: "js0",
      affiliation: null,
      token: null,
      privilege: "regular",
    });
    await newUser.save();

    const user = await Meteor.call<Student | null>("getUserByNetId", "js0");
    expect(user._id).toBe(newUser._id);
    expect(user.firstName).toBe(newUser.firstName);
    expect(user.lastName).toBe(newUser.lastName);
    expect(user.netId).toBe(newUser.netId);
    expect(user.privilege).toBe(newUser.privilege);
    expect(user.affiliation).toBeNull();
    expect(user.token).toBeNull();

    const no_user = await Meteor.call<Student | null>("getUserByNetId", "bop");
    expect(no_user).toBeNull();
  });
});
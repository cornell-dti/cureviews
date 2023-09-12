import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import { Student, Class, Professor, Review, Subject } from "common";
import * as http from "http";
import {
  Classes,
  Students,
  Subjects,
  Professors,
  Reviews,
} from "../db/dbDefs";
import { configure } from "../endpoints";

export const testingPort = 8080;

/**
 * This class sets up the express endpoint and mongo memory server for testing.
 */
export default class TestingServer {
  private mongoServer: MongoMemoryServer;

  private serverCloseHandle: http.Server;

  constructor(port) {
    this.mongoServer = new MongoMemoryServer();
    // setup express
    const app = express();
    this.serverCloseHandle = app.listen(port);
    configure(app);
  }

  setUpDB = async (
    reviews: Review[] = [],
    students: Student[] = [],
    classes: Class[] = [],
    professors: Professor[] = [],
    subjects: Subject[] = [],
  ) => {
    // setup db
    const mongoUri = await this.mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await mongoose.connection.collections.classes.createIndex({
      classFull: "text",
    });
    await mongoose.connection.collections.subjects.createIndex({
      subShort: "text",
    });
    await mongoose.connection.collections.professors.createIndex({
      fullName: "text",
    });

    // add classes, reviews, etc... to db collections
    await Promise.all(reviews.map(async (c) => await new Reviews(c).save()));

    await Promise.all(classes.map(async (c) => await new Classes(c).save()));

    await Promise.all(students.map(async (c) => await new Students(c).save()));

    await Promise.all(subjects.map(async (c) => await new Subjects(c).save()));

    await Promise.all(
      professors.map(async (c) => await new Professors(c).save()),
    );
  };

  shutdownTestingServer = async () => {
    await mongoose.disconnect();
    await this.mongoServer.stop();
    // serverCloseHandle becomes undefined sometimes for whatever reason so we
    // enclose in if statement
    if (this.serverCloseHandle !== undefined) {
      this.serverCloseHandle.close();
    }
  };
}

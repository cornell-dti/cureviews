import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import {
  Student,
  Class,
  Professor,
  Review,
  Subject,
  CourseEvaluation
} from 'common';
import * as http from 'http';
import {
  Classes,
  Students,
  Subjects,
  Professors,
  Reviews,
  CourseEvaluations
} from '../db/schema';
import { configure } from '../endpoints';

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
    app.use(express.json());
    configure(app);
    this.serverCloseHandle = app.listen(port);
  }

  setUpDB = async (
    reviews: Review[] = [],
    students: Student[] = [],
    classes: Class[] = [],
    professors: Professor[] = [],
    subjects: Subject[] = [],
    courseEvals: CourseEvaluation[] = []
  ) => {
    // setup db
    await this.mongoServer.start();

    const mongoUri = this.mongoServer.getUri();
    await mongoose.connect(mongoUri);

    await mongoose.connection.collections.classes.createIndex({
      classFull: 'text'
    });
    await mongoose.connection.collections.subjects.createIndex({
      subShort: 'text'
    });
    await mongoose.connection.collections.professors.createIndex({
      fullName: 'text'
    });

    // add classes, reviews, etc... to db collections
    await Promise.all(reviews.map(async (c) => await new Reviews(c).save()));

    await Promise.all(classes.map(async (c) => await new Classes(c).save()));

    await Promise.all(students.map(async (c) => await new Students(c).save()));

    await Promise.all(subjects.map(async (c) => await new Subjects(c).save()));

    await Promise.all(
      courseEvals.map(async (c) => await new CourseEvaluations(c).save())
    );

    await Promise.all(
      professors.map(async (c) => await new Professors(c).save())
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

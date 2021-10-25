import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from 'mongoose';
import express from "express";
import { Student, Class, Professor, Review, Subject } from 'common';
import { Classes, Students, Subjects, Professors, Reviews } from "../dbDefs";
import { configure } from "../endpoints";

export const testingPort = 8080;

export default class TestingServer {
  private mongoServer: MongoMemoryServer;

  private serverCloseHandle;

  private port: number;

  constructor(port) {
    this.port = port;
    this.mongoServer = new MongoMemoryServer();
    const app = express();
    this.serverCloseHandle = app.listen(port);
    configure(app);
  }

  getPort = () => this.port

  setUpDB = async (reviews: Review[] = [], students: Student[] = [],
    classes: Class[] = [], professors: Professor[] = [], subjects: Subject[] = []) => {
    const mongoUri = await this.mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    await mongoose.connection.collections.classes.createIndex({ classFull: "text" });
    await mongoose.connection.collections.subjects.createIndex({ subShort: "text" });
    await mongoose.connection.collections.professors.createIndex({ fullName: "text" });

    await Promise.all(
      reviews.map(async (c) => await (new Reviews(c).save())),
    );

    await Promise.all(
      classes.map(async (c) => await (new Classes(c).save())),
    );

    await Promise.all(
      students.map(async (c) => await (new Students(c).save())),
    );

    await Promise.all(
      subjects.map(async (c) => await (new Subjects(c).save())),
    );

    await Promise.all(
      professors.map(async (c) => await (new Professors(c).save())),
    );
  }

  emptyDB = async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(
      collections.map((c) => c.deleteMany({})),
    );
  }

  shutdownTestingServer = async () => {
    await mongoose.disconnect();
    await this.mongoServer.stop();
    if (this.serverCloseHandle !== undefined) {
      this.serverCloseHandle.close();
    }
    this.mongoServer = null;
    this.serverCloseHandle = null;
  }
}

import path from "path";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import cors from "cors";
import dotenv from "dotenv";
import { Meteor } from "./shim";
import { fetchAddCourses } from "./dbInit";
import { Classes } from "./dbDefs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../../client/build")));

function setup() {
  const port = process.env.PORT || 8080;
  Meteor.registerApp(app);
  Promise.all([import("./methods"), import("./publications")]).then(() => {
    Meteor.bind();
    app.get('*', (_, response) => response.sendFile(path.join(__dirname, '../../client/build/index.html')));
    // eslint-disable-next-line no-console
    app.listen(port, () => console.log(`Listening on port ${port}...`));
  });
}

const uri = process.env.MONGODB_URL ? process.env.MONGODB_URL : "this will error";
let localMongoServer;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => setup()).catch(async (err) => {
  console.log("No DB connection defined!");

  // If the environment variable is set, create a simple local db to work with
  // This could be expanded in the future with default mock admin accounts, etc.
  // For now, it fetches Fall 2019 classes for you to view
  // This is useful if you need a local db without any hassle, and don't want to risk damage to the staging db
  if (process.env.ALLOW_LOCAL === "1") {
    console.log("Falling back to local db!");
    localMongoServer = new MongoMemoryServer();
    const mongoUri = await localMongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    await fetchAddCourses("https://classes.cornell.edu/api/2.0/", "FA19").catch((err) => console.log(err));

    await mongoose.connection.collections.classes.createIndex({ classFull: "text" });
    await mongoose.connection.collections.subjects.createIndex({ subShort: "text" });
    await mongoose.connection.collections.professors.createIndex({ fullName: "text" });

    setup();
  } else {
    process.exit(1);
  }
});

import express from "express";
import mongoose from "mongoose";
import { Meteor } from "./shim";

import cors from "cors";

import { runTests } from "./scrapers"

const app = express();
app.use(cors());

function setup() {
  Meteor.registerApp(app);
  Promise.all([import("./methods"), import("./publications")]).then(() => {
    Meteor.bind();
    runTests(); // TODO disable
    // app.listen(process.env.port || 8080, () => console.log("Listening...")); // TODO re-enable
  });
}

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => setup());
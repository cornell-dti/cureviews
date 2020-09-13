import path from "path";
import express from "express";
import mongoose from "mongoose";

import cors from "cors";
import dotenv from "dotenv";
import { Meteor } from "./shim";
import { initializeBot, postReview } from "./bot";

export const web = initializeBot();
export const botPostReview = postReview;

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

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => setup());

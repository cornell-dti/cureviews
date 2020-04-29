import path from "path";
import express from "express";
import mongoose from "mongoose";
import { Meteor } from "./shim";

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../../client/build")));

function setup() {
  Meteor.registerApp(app);
  Promise.all([import("./methods"), import("./publications")]).then(() => {
    Meteor.bind();
    app.get('*', (_, response) => response.sendFile(path.join(__dirname, '../../client/build/index.html')));
    app.listen(process.env.PORT || 8080, () => console.log("Listening..."));
  });
}

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => setup());

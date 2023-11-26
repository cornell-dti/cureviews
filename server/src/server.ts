import path from "path";
import express from "express";
import sslRedirect from "heroku-ssl-redirect";

import cors from "cors";
import dotenv from "dotenv";

import auth from "./auth/auth.router";

import mongoose from "./utils/mongoose";

dotenv.config();
const app = express();
app.use(sslRedirect(["development", "production"]));

app.use(cors());

app.use("/api/auth", auth);

function setup() {
  const port = process.env.PORT || 8080;
  app.get("*", (_, response) => response.sendFile(path.join(__dirname, "../../client/build/index.html")));

  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

mongoose.then(async () => { setup(); });

import path from "path";
import express from "express";
import sslRedirect from "heroku-ssl-redirect";

import cors from "cors";
import dotenv from "dotenv";

import auth from "./auth/auth.router";
import profile from "./profile/profile.router";
import search from "./search/search.router";
import review from "./review/review.router";

import mongoose from "./utils/mongoose";

dotenv.config();
const app = express();
app.use(sslRedirect(["development", "production"]));

app.use(cors());

app.use("/api/auth", auth);
app.use('/api/profile', profile);
app.use('/api/search', search);
app.use('/api/review', review);

function setup() {
  const port = process.env.PORT || 8080;
  app.get("*", (_, response) => response.sendFile(path.join(__dirname, "../../client/build/index.html")));

  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

mongoose.then(async () => { setup(); });

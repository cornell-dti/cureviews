import path from "path";
import express from "express";
import sslRedirect from "heroku-ssl-redirect";

import cors from "cors";
import dotenv from "dotenv";
import { configure } from "./endpoints";

import mongoose from "./utils/mongoose";

import auth from "./auth/auth.router";

dotenv.config();

const port = process.env.PORT || 8080;

const app = express();
app.use(sslRedirect(["development", "production"]));
app.use(cors());

app.use("/api/auth", auth);

app.use(express.static(path.join(__dirname, '../../client/build')));

app.get("*", (_, response) => response.sendFile(path.join(__dirname, "../../client/build/index.html")));
configure(app);

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}...`));

mongoose.then(async () => { setup(); });

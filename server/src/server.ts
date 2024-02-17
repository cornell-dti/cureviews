/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable function-paren-newline */
import path from 'path';
import express from 'express';
import sslRedirect from 'heroku-ssl-redirect';
import cors from 'cors';
import { fileURLToPath } from "url"

import { setupDb } from './db/index.js';
import { configure } from './endpoints.js';

const app = express();

app.use(sslRedirect(['development', 'production']));

// technically not needed since we proxy calls?
app.use(cors());

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, '../../client/build')));

function setup() {
  const port = process.env.PORT || 8080;

  app.get('*', (_, response) =>
    response.sendFile(path.join(__dirname, '../../client/build/index.html')),
  );

  app.use(express.json());

  configure(app);

  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

setupDb().then(setup);

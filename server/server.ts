import path from 'path';
import express from 'express';
import sslRedirect from 'heroku-ssl-redirect';
import cors from 'cors';
import { configure } from './endpoints';

import { setupDb } from './db/index';

const app = express();
app.use(sslRedirect(['development', 'production']));
app.use(cors());
app.use(express.static(path.join(__dirname, '../../client/build')));

function setup() {
  const port = process.env.PORT || 8080;

  app.get('*', (_, response) =>
    response.sendFile(path.join(__dirname, '../../client/build/index.html')),
  );

  configure(app);

  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

setupDb().then(setup);

import path from 'path';
import express from 'express';
import sslRedirect from 'heroku-ssl-redirect';
import cors from 'cors';

import { setupDb } from './db/index';

import authRouter from './src/auth/auth.router';
import searchRouter from './src/search/search.router';
import profileRouter from './src/profile/profile.router';
import reviewRouter from './src/review/review.router';
import courseRouter from './src/course/course.router';
import adminRouter from './src/admin/admin.router';

import { configure } from './endpoints';

const app = express();
app.use(sslRedirect(['development', 'production']));
app.use(cors());
app.use(express.static(path.join(__dirname, '../../client/build')));

function setup() {
  const port = process.env.PORT || 8080;

  app.get('*', (_, response) =>
    response.sendFile(path.join(__dirname, '../../client/build/index.html')),
  );

  app.use(express.json());

  app.use(
    '/api',
    authRouter,
    searchRouter,
    profileRouter,
    reviewRouter,
    courseRouter,
    adminRouter,
  );

  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

setupDb().then(setup);

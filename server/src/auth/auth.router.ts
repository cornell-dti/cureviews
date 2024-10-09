import express from 'express';

import { Auth } from './auth';
import { AuthRequestType } from './auth.type';
import { insertUser } from '../utils';

export const authRouter = express.Router();

/** Reachable at POST /api/auth/new-user
 * @body token: a session's current token
 * Creates a new user and inserts them into the database
*/
authRouter.post('/new-user', async (req, res) => {
  try {
    const { token }: AuthRequestType = req.body;
    const auth = new Auth({ token });
    const ticket = await auth.getVerificationTicket();

    const result = await insertUser({ token: ticket });

    if (result) {
      return res.status(200).json({ result: true });
    }

    return res.status(400).json({ error: `Error in inserting new user.` });
  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error}` });
  }
});

/** Reachable at POST /api/auth/get-email
 * @body token: a session's current token
 * Gets the user's Cornell email address
*/
authRouter.post('/get-email', async (req, res) => {
  try {
    const { token }: AuthRequestType = req.body;
    const auth: Auth = new Auth({ token });

    const ticket = await auth.getVerificationTicket();
    if (!ticket) {
      return res
        .status(401)
        .json({ error: 'Invalid token, user unauthorized.' });
    }

    if (ticket.hd === 'cornell.edu') {
      return res.status(200).json({ result: ticket.email });
    }

    return res.status(400).json({ error: `Invalid email ${ticket.email}` });
  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error: ${error}` });
  }
});

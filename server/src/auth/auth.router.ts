import express from 'express';
import { Auth } from './auth';

import { verifyTokenAdmin } from './auth.controller';

const authRouter = express.Router();

authRouter.post('/getStudentEmailByToken', async (req, res) => {
  try {
    const { token } = req.body;
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

/*
 * Check if a token is for an admin
 */
authRouter.post('/tokenIsAdmin', async (req, res) => {
  try {
    const { token } = req.body;
    const auth: Auth = new Auth({ token });

    const isAdmin = await verifyTokenAdmin({ auth });

    res.status(200).json({ result: isAdmin });
  } catch (err) {
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

export default authRouter;

import express from 'express';
import { Auth } from './auth';

import { verifyToken } from './auth.controller';

const authRouter = express.Router();

authRouter.post('/getStudentEmailByToken', async (req, res) => {
  try {
    const { token } = req.body;
    const auth: Auth = new Auth({ token });

    const ticket = await auth.getVerificationTicket();
    if (ticket.hd === 'cornell.edu') {
      return res.status(200).json({ result: ticket.email });
    }

    return res.status(400).json({ error: `Invalid email ${ticket.email}` });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.result}` });
  }
});

/*
 * Check if a token is for an admin
 */
authRouter.post('/tokenIsAdmin', async (req, res) => {
  const { token } = req.body;
  const auth: Auth = new Auth({ token });

  await verifyToken(auth);
});

export default authRouter;

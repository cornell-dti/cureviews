import express from 'express';
import { verifyAdminToken } from './auth.controller';
import { AdminRequest } from './auth.dto';

const router = express.Router();

/*
 * Check if a token is for an admin
 */
router.post('/isAdmin', async (req, res) => {
  const adminRequest = req.body as AdminRequest;
  try {
    const verify = await verifyAdminToken(adminRequest.token);

    if (verify === false) {
      return res.status(400).json({ error: `Unable to verify token: ${adminRequest.token} as an admin.` });
    }

    res.status(200).json({ message: `Token: ${adminRequest.token} was successfully verified as an admin user.` });
  } catch (err) {
    res.status(500).json({ error: `An error occurred: ${err} in the 'isAdmin' endpoint.` });
  }
});

export default router;

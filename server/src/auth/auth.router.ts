import express from 'express';
import { verifyAdminToken } from './auth.controller';
import { AdminRequest } from './auth.dto';

const router = express.Router();

/*
 * Check if a token is for an admin
 */
router.post('/isAdmin', async (req, res) => {
  const adminRequest = req.body as AdminRequest;
  await verifyAdminToken(adminRequest.token);
});

export default router;

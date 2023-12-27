import express from 'express';

const authRouter = express.Router();

authRouter.post('/', (req, res) => {
  res.json({ message: 'hello' });
});

export default authRouter;

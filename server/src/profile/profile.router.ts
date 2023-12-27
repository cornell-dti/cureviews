import express from 'express';

const profileRouter = express.Router();

profileRouter.post('/', (req, res) => {
  res.json({ message: 'hello' });
});

export default profileRouter;

import express from 'express';

const reviewRouter = express.Router();

reviewRouter.post('/', (req, res) => {
  res.json({ message: 'hello' });
});

export default reviewRouter;

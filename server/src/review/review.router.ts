import express from 'express';

const reviewRouter = express.Router();

reviewRouter.post('/', (req, res) => {
  res.json({ result: 'hello' });
});

export default reviewRouter;

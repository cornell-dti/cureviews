import express from 'express';

const adminRouter = express.Router();

adminRouter.post('/makeReviewVisible', (req, res) => {
  res.json({ result: 'hello' });
});

export default adminRouter;

import express from 'express';

const adminRouter = express.Router();

adminRouter.post('/', (req, res) => {
  res.json({ message: 'hello' });
});

export default adminRouter;

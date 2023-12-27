import express from 'express';

const searchRouter = express.Router();

searchRouter.post('/', (req, res) => {
  res.json({ message: 'hello' });
});

export default searchRouter;

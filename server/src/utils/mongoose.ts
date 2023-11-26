import mongoose from 'mongoose';

const uri = process.env.MONGODB_URL
  ? process.env.MONGODB_URL
  : 'this will error';

export default mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

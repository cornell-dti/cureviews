import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URL
  ? process.env.MONGODB_URL
  : 'Please include a valid MONGODB_URL in the .env file';

export async function setupDb() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('No DB connection defined!');
    process.exit(1);
  }
}

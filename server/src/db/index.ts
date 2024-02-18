import mongoose from 'mongoose';

import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URL
  ? process.env.MONGODB_URL
  : 'Please include a valid MONGODB_URL in the .env file';

export async function setupDb() {
  console.log(uri)
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('No DB connection defined!');
    process.exit(1);
  }
}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.DB_URL;

mongoose.connect(uri).then(async () => {
  const users = mongoose.connection.collection('users');
  const admin = await users.findOne({ role: 'admin' });
  console.log("Admin User:", admin);
  process.exit(0);
}).catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Task from './models/Task.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
    
    // Verify connection string
    let uri = mongoUri;
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      uri = 'mongodb://127.0.0.1:27017/taskflow';
    }

    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // Delete users
    const userRes = await User.deleteMany({});
    console.log(`Deleted ${userRes.deletedCount} users from the database.`);

    // Delete tasks
    const taskRes = await Task.deleteMany({});
    console.log(`Deleted ${taskRes.deletedCount} tasks from the database.`);

    console.log('Database clear completed successfully.');
  } catch (error) {
    console.error('Error clearing database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

clearDatabase();

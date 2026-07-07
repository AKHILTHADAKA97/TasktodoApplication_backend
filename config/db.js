import mongoose from 'mongoose';

const connectDB = async () => {
  let uri = process.env.MONGO_URI || '';
  
  // Verify if it's a valid connection string format
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.warn(`WARNING: Invalid MONGO_URI format in .env. Falling back to local MongoDB: mongodb://127.0.0.1:27017/taskflow`);
    uri = 'mongodb://127.0.0.1:27017/taskflow';
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Falling back to local 127.0.0.1 MongoDB...');
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/taskflow');
      console.log(`MongoDB Fallback Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`MongoDB Fallback Connection Error: ${fallbackError.message}`);
      console.error('CRITICAL: Server will continue running, but database operations will fail until MongoDB is started.');
    }
  }
};

export default connectDB;

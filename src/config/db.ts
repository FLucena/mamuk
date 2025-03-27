import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local if it exists
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Configure mongoose
mongoose.set('strictQuery', false);

// Database connection function
const connectDB = async (): Promise<boolean> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error: unknown) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    console.log('Check your MongoDB URI and network connection');
    return false;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Handle application termination
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
  }
  process.exit(0);
});

export default connectDB; 
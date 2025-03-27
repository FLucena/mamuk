import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables');
  throw new Error('Please define MONGODB_URI in your environment variables');
}

// Configure mongoose
mongoose.set('strictQuery', false);

// Track connection status
let isConnected = false;

/**
 * Connect to MongoDB
 * @returns {Promise<typeof mongoose>} Mongoose instance
 */
export const connectToDatabase = async (): Promise<typeof mongoose> => {
  // If already connected, return the existing connection
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    return mongoose;
  } catch (error: unknown) {
    isConnected = false;
    console.error(`MongoDB connection error: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.message.includes('ETIMEDOUT')) {
      console.error('Connection timed out. Please check:');
      console.error('1. Your network connection');
      console.error('2. MongoDB Atlas IP whitelist settings');
      console.error('3. VPN or firewall restrictions');
    }
    
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB disconnected');
  }
};

// Database connection event handlers
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

// Export default for backward compatibility
export default connectToDatabase; 
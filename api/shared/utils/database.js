import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 * This utility function safely connects to MongoDB and prevents 
 * multiple connections in serverless environments
 */
export const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

/**
 * Close MongoDB connection
 * Can be useful in some serverless environments to free resources
 */
export const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}; 
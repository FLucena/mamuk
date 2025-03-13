import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
  connectionStartTime?: number;
}

declare global {
  var mongoose: GlobalMongoose;
}

// Initialize the cached connection
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null, isConnecting: false };
}

const cached = global.mongoose;

// Set up event listeners only once
if (!cached.conn) {
  // Increase max listeners to prevent warning
  mongoose.connection.setMaxListeners(15);

  // Handle connection events
  mongoose.connection.on('connected', () => {
    if (cached.connectionStartTime) {
      const connectionTime = Date.now() - cached.connectionStartTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`MongoDB connected in ${connectionTime}ms`);
      }
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    // Reset connection state on error
    cached.isConnecting = false;
    cached.promise = null;
  });

  mongoose.connection.on('disconnected', () => {
    // Reset connection state on disconnect
    cached.isConnecting = false;
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB connection closure:', err);
      process.exit(1);
    }
  });
}

export async function dbConnect() {
  // If already connected, return the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // If already connecting, wait for the existing promise
  if (cached.isConnecting && cached.promise) {
    return cached.promise;
  }

  // Set connecting state
  cached.isConnecting = true;
  cached.connectionStartTime = Date.now();

  // If no connection promise exists, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 20, // Increased from 10 to handle more concurrent connections
      minPoolSize: 5,  // Keep a minimum of connections open
      serverSelectionTimeoutMS: 10000, // Increased from 5000 to allow more time for server selection
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Add connection timeout
      family: 4,
      retryWrites: true,
      retryReads: true,
      // Add connection timeout handling
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    cached.isConnecting = false;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.isConnecting = false;
    console.error('Database connection error:', e);
    throw e;
  }
} 
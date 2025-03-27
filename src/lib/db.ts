import mongoose from 'mongoose';

// Environment variables (would typically be in a .env file)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mamuk-fitness';

interface ConnectionOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  autoIndex: boolean;
}

// Connection options
const options: ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true, // Build indexes (set to false in production for better performance)
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = options;

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Disconnect from database - useful for tests
export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

// Database connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle application termination and close MongoDB connection
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
}); 
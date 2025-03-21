import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
}

// @ts-ignore - Global mongoose type
let cached: GlobalMongoose = global._mongooseCache || { 
  conn: null, 
  promise: null,
  isConnecting: false
};

if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise && !cached.isConnecting) {
    const opts = {
      bufferCommands: false,
    };

    cached.isConnecting = true;
    const startTime = Date.now();
    
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected in', Date.now() - startTime, 'ms');
      cached.isConnecting = false;
      return mongoose;
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
      cached.isConnecting = false;
      throw err;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

// Add type definition for the global mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: GlobalMongoose;
}

// Create a MongoDB client promise for NextAuth
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI!);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI!);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Add type definition for the global MongoDB client promise
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>;
} 
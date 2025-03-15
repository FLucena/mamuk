import mongoose from 'mongoose';
import { createIndexes, getQueryHint } from './db/indexes';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
  connectionStartTime?: number;
  lastUsed?: number;
  queryTimes: number[];
  indexesCreated?: boolean;
}

declare global {
  var mongoose: GlobalMongoose;
}

// Initialize the cached connection
if (!global.mongoose) {
  global.mongoose = { 
    conn: null, 
    promise: null, 
    isConnecting: false,
    queryTimes: [],
    indexesCreated: false
  };
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
      
      // Create indexes in development mode
      if (process.env.NODE_ENV === 'development' && !cached.indexesCreated) {
        createIndexes().then(() => {
          cached.indexesCreated = true;
        });
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

// Function to track slow queries
function trackQueryPerformance() {
  // Skip if mongoose.Query is not available (e.g., in test environment)
  if (!mongoose.Query || !mongoose.Query.prototype || !mongoose.Query.prototype.exec) {
    console.warn('MongoDB Query tracking not available - skipping performance monitoring');
    return;
  }

  // We'll use a simpler approach without schema plugins to avoid TypeScript errors
  const originalExec = mongoose.Query.prototype.exec;
  
  mongoose.Query.prototype.exec = function(this: mongoose.Query<any, any>) {
    const startTime = Date.now();
    const collection = this.model.collection.name;
    // Access operation type safely
    const operation = (this as any).op || 'unknown';
    
    // Check if query has hints or indexes
    const hasHint = !!(this as any)._hint;
    const filter = this.getFilter();
    
    // Try to apply a hint if one is not already set
    if (!hasHint) {
      // Determine query type based on filter and operation
      let queryType = '';
      
      if (collection === 'users') {
        if (filter.email && !filter.sub) {
          queryType = 'findByEmail';
        } else if (filter.sub && !filter.email) {
          queryType = 'findBySub';
        } else if (filter.$or && filter.$or.some((cond: any) => cond.email || cond.sub)) {
          queryType = 'findByEmailOrSub';
        } else if (filter.roles) {
          queryType = 'findByRoles';
        }
      } else if (collection === 'workouts') {
        if (filter.userId) {
          queryType = operation === 'find' && (this as any).options?.sort?.createdAt === -1 
            ? 'findByUserIdSorted' 
            : 'findByUserId';
        } else if (filter.name) {
          queryType = 'findByName';
        }
      }
      
      // Apply hint if we have one for this query type
      if (queryType) {
        const hint = getQueryHint(collection, queryType);
        if (hint) {
          this.hint(hint);
        }
      }
    }
    
    return originalExec.apply(this, arguments as any).then((result: any) => {
      const queryTime = Date.now() - startTime;
      
      // Store query times for analysis (keep last 100)
      cached.queryTimes.push(queryTime);
      if (cached.queryTimes.length > 100) {
        cached.queryTimes.shift();
      }
      
      // Adaptive threshold based on query complexity and collection size
      let threshold = 500; // Default threshold
      
      // Adjust threshold based on operation type
      if (operation === 'find' && Object.keys(filter).length <= 1) {
        threshold = 200; // Simple finds should be faster
      } else if (operation === 'aggregate') {
        threshold = 800; // Aggregations can be more complex
      }
      
      // Log slow queries
      if (queryTime > threshold) {
        console.warn(`[PERFORMANCE] Slow MongoDB query: ${queryTime}ms`, {
          operation,
          collection,
          filter: JSON.stringify(filter),
          hasHint,
          // Suggest adding an index if query is consistently slow
          suggestion: !hasHint ? 'Consider adding an index or using .hint()' : undefined
        });
      }
      
      return result;
    });
  };
}

// Initialize query performance tracking
trackQueryPerformance();

export async function dbConnect() {
  // If already connected, return the existing connection
  if (cached.conn) {
    // Update last used timestamp
    cached.lastUsed = Date.now();
    return cached.conn;
  }

  // If already connecting, wait for the existing promise
  if (cached.isConnecting && cached.promise) {
    return cached.promise;
  }

  // Set connecting state
  cached.isConnecting = true;
  cached.connectionStartTime = Date.now();
  cached.lastUsed = Date.now();

  // If no connection promise exists, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 30, // Increased from 20 to handle more concurrent connections
      minPoolSize: 10,  // Keep a minimum of connections open
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      retryWrites: true,
      retryReads: true,
      heartbeatFrequencyMS: 10000,
      autoIndex: process.env.NODE_ENV !== 'production', // Only auto-index in development
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    cached.isConnecting = false;
    
    // Log connection pool stats in development
    if (process.env.NODE_ENV === 'development') {
      try {
        // @ts-ignore - Accessing internal MongoDB driver properties
        const poolSize = mongoose.connection.client?.topology?.connections?.length || 0;
        console.log(`MongoDB connection pool size: ${poolSize}`);
      } catch (err) {
        console.log('Could not determine MongoDB connection pool size');
      }
    }
    
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.isConnecting = false;
    console.error('Database connection error:', e);
    throw e;
  }
}

// Get database stats for monitoring
export function getDbStats() {
  if (!cached.conn) return null;
  
  const avgQueryTime = cached.queryTimes.length > 0 
    ? cached.queryTimes.reduce((sum, time) => sum + time, 0) / cached.queryTimes.length 
    : 0;
  
  let poolSize = 0;
  try {
    // @ts-ignore - Accessing internal MongoDB driver properties
    poolSize = mongoose.connection.client?.topology?.connections?.length || 0;
  } catch (err) {
    console.log('Could not determine MongoDB connection pool size');
  }
  
  return {
    isConnected: mongoose.connection.readyState === 1,
    poolSize,
    avgQueryTime: Math.round(avgQueryTime),
    lastUsed: cached.lastUsed,
    slowQueries: cached.queryTimes.filter(time => time > 500).length,
    indexesCreated: cached.indexesCreated
  };
} 
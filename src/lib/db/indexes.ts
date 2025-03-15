/**
 * MongoDB Index Management
 * 
 * This file defines and creates indexes for MongoDB collections to improve query performance.
 * Indexes are created when the application starts in development mode or can be manually triggered.
 */

import mongoose from 'mongoose';
import { dbConnect } from '../db';

// Define the types for index definitions
interface IndexDefinition {
  fields: Record<string, 1 | -1>;
  options: {
    unique?: boolean;
    sparse?: boolean;
    name: string;
    [key: string]: any;
  };
}

// Define indexes for each collection
const COLLECTION_INDEXES: Record<string, IndexDefinition[]> = {
  users: [
    // Index for email and sub fields (used in authentication)
    { 
      fields: { email: 1 },
      options: { unique: true, sparse: true, name: 'email_unique' }
    },
    { 
      fields: { sub: 1 },
      options: { unique: true, sparse: true, name: 'sub_unique' }
    },
    // Compound index for auth queries that use both email and sub
    { 
      fields: { email: 1, sub: 1 },
      options: { name: 'email_sub_auth' }
    },
    // Index for roles (used in authorization checks)
    { 
      fields: { roles: 1 },
      options: { name: 'roles_lookup' }
    }
  ],
  workouts: [
    // Index for user ID (used to find user's workouts)
    { 
      fields: { userId: 1 },
      options: { name: 'userId_lookup' }
    },
    // Index for workout name (used in search)
    { 
      fields: { name: 1 },
      options: { name: 'name_search' }
    },
    // Compound index for user and creation date (for sorting)
    { 
      fields: { userId: 1, createdAt: -1 },
      options: { name: 'userId_createdAt_sort' }
    }
  ],
  // Add more collections and their indexes as needed
};

/**
 * Creates all defined indexes for MongoDB collections
 */
export async function createIndexes() {
  try {
    console.log('Creating MongoDB indexes...');
    await dbConnect();
    
    // Create indexes for each collection
    for (const [collectionName, indexes] of Object.entries(COLLECTION_INDEXES)) {
      const collection = mongoose.connection.collection(collectionName);
      
      for (const index of indexes) {
        try {
          // Cast options to any to avoid TypeScript errors with mongoose types
          await collection.createIndex(index.fields, index.options as any);
          console.log(`Created index ${index.options.name} on ${collectionName}`);
        } catch (error) {
          console.error(`Error creating index ${index.options.name} on ${collectionName}:`, error);
        }
      }
    }
    
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error creating MongoDB indexes:', error);
  }
}

// Type for query hints
type HintType = Record<string, 1 | -1>;

/**
 * Returns a hint object for a specific collection and query pattern
 * @param collection Collection name
 * @param queryType Type of query being performed
 * @returns Hint object to use with MongoDB queries
 */
export function getQueryHint(collection: string, queryType: string): HintType | null {
  // Define hints for common query patterns
  const QUERY_HINTS: Record<string, Record<string, HintType>> = {
    users: {
      findByEmail: { email: 1 },
      findBySub: { sub: 1 },
      findByEmailOrSub: { email: 1, sub: 1 },
      findByRoles: { roles: 1 }
    },
    workouts: {
      findByUserId: { userId: 1 },
      findByName: { name: 1 },
      findByUserIdSorted: { userId: 1, createdAt: -1 }
    }
  };
  
  // Return the appropriate hint or null if not found
  return QUERY_HINTS[collection]?.[queryType] || null;
} 
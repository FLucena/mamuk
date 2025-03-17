// Script to fix MongoDB index issues
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixIndexes() {
  // Get MongoDB connection string from environment variables
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set in .env.local file');
    console.error('Please make sure you have a valid MONGODB_URI in your .env.local file');
    process.exit(1);
  }
  
  console.log('Using MongoDB URI:', uri.substring(0, 20) + '...');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // List all indexes on the users collection
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:');
    console.log(JSON.stringify(indexes, null, 2));
    
    // Check if we have duplicate indexes on email field
    const emailIndexes = indexes.filter(index => 
      index.key && index.key.email !== undefined && 
      // Exclude compound indexes that include email
      Object.keys(index.key).length === 1
    );
    
    console.log(`Found ${emailIndexes.length} indexes on email field`);
    
    // Check if email_unique_index already exists
    const targetIndexName = 'email_unique_index';
    const existingTargetIndex = indexes.find(index => index.name === targetIndexName);
    
    if (existingTargetIndex) {
      console.log(`Index ${targetIndexName} already exists, no need to create it`);
    } else {
      // Find the best existing index to keep (preferably sparse and unique)
      const bestIndex = emailIndexes.find(index => index.sparse === true && index.unique === true);
      
      if (bestIndex) {
        console.log(`Found a suitable index: ${bestIndex.name}`);
        console.log(`Renaming index ${bestIndex.name} to ${targetIndexName}`);
        
        // To rename an index, we need to:
        // 1. Create a new index with the desired name and same options
        // 2. Drop the old index
        try {
          // Create new index with the target name
          await usersCollection.createIndex(
            { email: 1 },
            { 
              unique: bestIndex.unique || true, 
              name: targetIndexName,
              background: true,
              sparse: bestIndex.sparse || true
            }
          );
          console.log(`Created new index ${targetIndexName}`);
          
          // Drop the old index
          await usersCollection.dropIndex(bestIndex.name);
          console.log(`Dropped old index ${bestIndex.name}`);
        } catch (error) {
          if (error.code === 85) { // IndexOptionsConflict
            console.log('Index options conflict. Dropping all email indexes and creating a new one.');
            
            // Drop all email indexes except _id
            for (const index of emailIndexes) {
              try {
                await usersCollection.dropIndex(index.name);
                console.log(`Dropped index ${index.name}`);
              } catch (dropError) {
                console.error(`Error dropping index ${index.name}:`, dropError.message);
              }
            }
            
            // Create a new index with the target name
            await usersCollection.createIndex(
              { email: 1 },
              { 
                unique: true, 
                name: targetIndexName,
                background: true,
                sparse: true
              }
            );
            console.log(`Created new index ${targetIndexName}`);
          } else {
            throw error;
          }
        }
      } else if (emailIndexes.length > 0) {
        // If no sparse unique index exists, drop all email indexes and create a new one
        console.log('No suitable index found. Dropping all email indexes and creating a new one.');
        
        // Drop all email indexes
        for (const index of emailIndexes) {
          try {
            await usersCollection.dropIndex(index.name);
            console.log(`Dropped index ${index.name}`);
          } catch (error) {
            console.error(`Error dropping index ${index.name}:`, error.message);
          }
        }
        
        // Create a new index with the target name
        await usersCollection.createIndex(
          { email: 1 },
          { 
            unique: true, 
            name: targetIndexName,
            background: true,
            sparse: true
          }
        );
        console.log(`Created new index ${targetIndexName}`);
      } else {
        console.log('No email indexes found. Creating a new one.');
        
        // Create a new index with the target name
        await usersCollection.createIndex(
          { email: 1 },
          { 
            unique: true, 
            name: targetIndexName,
            background: true,
            sparse: true
          }
        );
        console.log(`Created new index ${targetIndexName}`);
      }
    }
    
    // List indexes after changes
    const updatedIndexes = await usersCollection.indexes();
    console.log('Updated indexes:');
    console.log(JSON.stringify(updatedIndexes, null, 2));
    
    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

fixIndexes().catch(console.error); 
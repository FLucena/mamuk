/**
 * Script to create an admin user
 * Run with: node scripts/create-admin.js
 * 
 * WARNING: This script contains hardcoded passwords for DEVELOPMENT USE ONLY.
 * These credentials should never be used in production environments.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mamuk';

console.log(`Using MongoDB URI: ${MONGODB_URI.substring(0, MONGODB_URI.indexOf('://') + 3)}...`);

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

// Define User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Date,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  roles: {
    type: [String],
    enum: ['admin', 'coach', 'customer'],
    default: ['customer'],
    required: true
  },
  password: String,
  provider: String,
  lastLogin: Date
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Create admin user
async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mamuk.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@mamuk.com',
      emailVerified: new Date(),
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      roles: ['admin'],
      provider: 'credentials',
      // Use environment variable if available, otherwise use default (for development only)
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
      lastLogin: new Date()
    };

    const newAdmin = await User.create(adminUser);
    console.log('Admin user created successfully:', newAdmin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createAdminUser(); 
/**
 * Script to create users directly in the database
 * Run with: node scripts/create-users-simple.js
 * 
 * WARNING: This script contains hardcoded passwords for DEVELOPMENT USE ONLY.
 * These credentials should never be used in production environments.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

console.log('Connecting to MongoDB...');

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  emailVerified: Date,
  image: String,
  roles: {
    type: [String],
    enum: ['admin', 'coach', 'customer'],
    default: ['customer']
  },
  password: String,
  provider: { type: String, default: 'credentials' }
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Create users
async function createUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@mamuk.com',
      emailVerified: new Date(),
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      roles: ['admin'],
      // Use environment variable if available, otherwise use default (for development only)
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
      provider: 'credentials'
    };

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
    } else {
      await User.create(adminUser);
      console.log('Admin user created:', adminUser.email);
    }

    // Create coach user
    const coachUser = {
      name: 'Coach User',
      email: 'coach@mamuk.com',
      emailVerified: new Date(),
      image: 'https://randomuser.me/api/portraits/men/2.jpg',
      roles: ['coach'],
      // Use environment variable if available, otherwise use default (for development only)
      password: await bcrypt.hash(process.env.COACH_PASSWORD || 'coach123', 10),
      provider: 'credentials'
    };

    // Check if coach exists
    const existingCoach = await User.findOne({ email: coachUser.email });
    if (existingCoach) {
      console.log('Coach user already exists:', existingCoach.email);
    } else {
      await User.create(coachUser);
      console.log('Coach user created:', coachUser.email);
    }

    // Create customer user
    const customerUser = {
      name: 'Customer User',
      email: 'customer@mamuk.com',
      emailVerified: new Date(),
      image: 'https://randomuser.me/api/portraits/women/1.jpg',
      roles: ['customer'],
      // Use environment variable if available, otherwise use default (for development only)
      password: await bcrypt.hash(process.env.CUSTOMER_PASSWORD || 'customer123', 10),
      provider: 'credentials'
    };

    // Check if customer exists
    const existingCustomer = await User.findOne({ email: customerUser.email });
    if (existingCustomer) {
      console.log('Customer user already exists:', existingCustomer.email);
    } else {
      await User.create(customerUser);
      console.log('Customer user created:', customerUser.email);
    }

    console.log('User creation completed');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createUsers(); 
/**
 * Script to create multiple random users
 * Run with: node scripts/create-random-users.js
 * 
 * WARNING: This script contains hardcoded passwords for DEVELOPMENT USE ONLY.
 * These credentials should never be used in production environments.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

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
  provider: { type: String, default: 'credentials' },
  height: Number,
  weight: Number,
  birthdate: Date,
  gender: String,
  fitnessLevel: String,
  fitnessGoals: [String],
  preferredWorkoutDays: [String],
  lastLogin: Date
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Generate a random user
function generateRandomUser(role, index) {
  const fitnessLevels = ['beginner', 'intermediate', 'advanced'];
  const fitnessGoalsOptions = [
    'weight loss', 'muscle gain', 'endurance', 'flexibility', 
    'strength', 'general fitness', 'rehabilitation'
  ];
  const genders = ['male', 'female', 'other'];
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return {
    name: faker.person.fullName(),
    email: `${role}${index}@mamuk.com`,
    emailVerified: new Date(),
    image: faker.image.avatar(),
    roles: [role],
    password: bcrypt.hashSync(process.env.DEFAULT_USER_PASSWORD || 'password123', 10),
    provider: Math.random() > 0.5 ? 'google' : 'credentials',
    lastLogin: new Date(),
    height: Math.floor(Math.random() * 50) + 150, // 150-200 cm
    weight: Math.floor(Math.random() * 75) + 45, // 45-120 kg
    birthdate: faker.date.birthdate(),
    gender: genders[Math.floor(Math.random() * genders.length)],
    fitnessLevel: fitnessLevels[Math.floor(Math.random() * fitnessLevels.length)],
    fitnessGoals: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      fitnessGoalsOptions[Math.floor(Math.random() * fitnessGoalsOptions.length)]
    ),
    preferredWorkoutDays: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
      weekdays[Math.floor(Math.random() * weekdays.length)]
    )
  };
}

// Create users
async function createRandomUsers(coachCount = 3, customerCount = 10) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create coaches
    const createdCoaches = [];
    for (let i = 0; i < coachCount; i++) {
      const coach = generateRandomUser('coach', i);
      try {
        const existingCoach = await User.findOne({ email: coach.email });
        if (!existingCoach) {
          const newCoach = await User.create(coach);
          createdCoaches.push(newCoach);
          console.log('Coach created:', coach.email);
        } else {
          console.log('Coach already exists:', coach.email);
          createdCoaches.push(existingCoach);
        }
      } catch (error) {
        console.error(`Error creating coach:`, error);
      }
    }

    // Create customers
    for (let i = 0; i < customerCount; i++) {
      const customer = generateRandomUser('customer', i);
      
      // Randomly assign a coach to some customers
      if (createdCoaches.length > 0 && Math.random() > 0.3) {
        const randomCoach = createdCoaches[Math.floor(Math.random() * createdCoaches.length)];
        customer.coach = randomCoach._id;
      }
      
      try {
        const existingCustomer = await User.findOne({ email: customer.email });
        if (!existingCustomer) {
          await User.create(customer);
          console.log('Customer created:', customer.email);
        } else {
          console.log('Customer already exists:', customer.email);
        }
      } catch (error) {
        console.error(`Error creating customer:`, error);
      }
    }

    console.log(`Created ${coachCount} coaches and ${customerCount} customers`);
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const coachCount = parseInt(args[0]) || 3;
const customerCount = parseInt(args[1]) || 10;

// Run the function
createRandomUsers(coachCount, customerCount); 
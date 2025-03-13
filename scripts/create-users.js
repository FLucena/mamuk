/**
 * Script to create users directly in the database
 * Run with: node scripts/create-users.js
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

console.log(`Using MongoDB URI: ${MONGODB_URI.substring(0, MONGODB_URI.indexOf('://') + 3)}...`);

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
  lastLogin: Date,
  height: Number,
  weight: Number,
  birthdate: Date,
  gender: String,
  fitnessLevel: String,
  fitnessGoals: [String],
  preferredWorkoutDays: [String]
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
    password: bcrypt.hashSync('password123', 10),
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
async function createUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin if it doesn't exist
    const existingAdmin = await User.findOne({ roles: 'admin' });
    if (!existingAdmin) {
      const adminUser = {
        name: 'Admin User',
        email: 'admin@mamuk.com',
        emailVerified: new Date(),
        image: faker.image.avatar(),
        roles: ['admin'],
        password: bcrypt.hashSync('admin123', 10),
        provider: 'credentials',
        lastLogin: new Date()
      };
      
      await User.create(adminUser);
      console.log('Admin user created:', adminUser.email);
    } else {
      console.log('Admin user already exists:', existingAdmin.email);
    }

    // Create coaches
    const coachCount = 3;
    for (let i = 0; i < coachCount; i++) {
      const coach = generateRandomUser('coach', i);
      try {
        const existingCoach = await User.findOne({ email: coach.email });
        if (!existingCoach) {
          await User.create(coach);
          console.log('Coach created:', coach.email);
        } else {
          console.log('Coach already exists:', coach.email);
        }
      } catch (error) {
        console.error(`Error creating coach:`, error);
      }
    }

    // Create customers
    const customerCount = 10;
    for (let i = 0; i < customerCount; i++) {
      const customer = generateRandomUser('customer', i);
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
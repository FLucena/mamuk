/**
 * Seed script to create 10 dummy users with different data and properties
 * Run with: node scripts/seed-users.js
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
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
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Google-specific fields
  sub: {
    type: String,
    unique: true,
    sparse: true,
    required: false
  },
  provider: {
    type: String,
    default: 'credentials',
    required: true
  },
  // For credentials provider
  password: {
    type: String,
    required: false
  },
  height: {
    type: Number,
    required: false
  },
  weight: {
    type: Number,
    required: false
  },
  birthdate: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: false
  },
  fitnessGoals: {
    type: [String],
    required: false
  },
  preferredWorkoutDays: {
    type: [String],
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: false
  },
  lastLogin: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Generate random users
async function generateUsers(count) {
  const users = [];
  const coaches = [];
  
  // Create 3 coaches first
  for (let i = 0; i < 3; i++) {
    const coach = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      emailVerified: faker.date.past(),
      image: faker.image.avatar(),
      roles: ['coach'],
      provider: 'google',
      sub: faker.string.uuid(),
      height: faker.number.int({ min: 150, max: 200 }),
      weight: faker.number.int({ min: 50, max: 100 }),
      birthdate: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
      gender: faker.helpers.arrayElement(['male', 'female']),
      fitnessLevel: 'advanced',
      fitnessGoals: ['strength', 'endurance'],
      preferredWorkoutDays: faker.helpers.arrayElements(
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        { min: 3, max: 5 }
      ),
      lastLogin: faker.date.recent()
    };
    
    try {
      const savedCoach = await User.create(coach);
      coach._id = savedCoach._id;
      users.push(coach);
      coaches.push(coach);
      console.log(`Created coach: ${coach.name} (${coach.email})`);
    } catch (error) {
      console.log(`Coach with email ${coach.email} already exists, skipping...`);
    }
  }
  
  // Create 1 admin
  const admin = {
    name: 'Admin User',
    email: 'admin@mamuk.com',
    emailVerified: new Date(),
    image: faker.image.avatar(),
    roles: ['admin'],
    provider: 'credentials',
    password: await bcrypt.hash('admin123', 10),
    lastLogin: new Date()
  };
  
  try {
    await User.create(admin);
    users.push(admin);
    console.log(`Created admin: ${admin.name} (${admin.email})`);
  } catch (error) {
    console.log(`Admin user already exists, skipping...`);
  }
  
  // Create regular customers
  for (let i = 0; i < count - 4; i++) {
    const fitnessLevels = ['beginner', 'intermediate', 'advanced'];
    const fitnessGoalsOptions = [
      'weight loss', 'muscle gain', 'endurance', 'flexibility', 
      'strength', 'general fitness', 'rehabilitation'
    ];
    
    const customer = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      emailVerified: faker.helpers.maybe(() => faker.date.past(), { probability: 0.8 }),
      image: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.7 }),
      roles: ['customer'],
      provider: faker.helpers.arrayElement(['google', 'credentials']),
      sub: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.5 }),
      password: faker.helpers.maybe(() => bcrypt.hashSync('password123', 10), { probability: 0.5 }),
      height: faker.number.int({ min: 150, max: 200 }),
      weight: faker.number.int({ min: 45, max: 120 }),
      birthdate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      fitnessLevel: faker.helpers.arrayElement(fitnessLevels),
      fitnessGoals: faker.helpers.arrayElements(fitnessGoalsOptions, { min: 1, max: 3 }),
      preferredWorkoutDays: faker.helpers.arrayElements(
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        { min: 1, max: 7 }
      ),
      lastLogin: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 })
    };
    
    // Assign a coach to some customers
    if (faker.helpers.maybe(() => true, { probability: 0.6 }) && coaches.length > 0) {
      const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];
      customer.coach = randomCoach._id;
    }
    
    try {
      await User.create(customer);
      users.push(customer);
      console.log(`Created customer: ${customer.name} (${customer.email})`);
    } catch (error) {
      console.log(`User with email ${customer.email} already exists, skipping...`);
    }
  }
  
  return users;
}

// Seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if users already exist
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} users.`);
    }
    
    // Generate users
    console.log('Creating 10 dummy users...');
    await generateUsers(10);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedDatabase(); 
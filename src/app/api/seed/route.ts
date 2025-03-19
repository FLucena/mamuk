import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/user';
import bcrypt from 'bcryptjs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Define UserData interface for better type safety
interface UserData {
  name: string;
  email: string;
  emailVerified: Date;
  image: string;
  roles: string[];
  provider: string;
  password: string;
  height?: number;
  weight?: number;
  birthdate?: Date;
  gender?: string;
  fitnessLevel?: string;
  fitnessGoals?: string[];
  preferredWorkoutDays?: string[];
  lastLogin: Date;
  coach?: string;
}

// Generate a random user
function generateRandomUser(role: 'admin' | 'coach' | 'customer', index: number): UserData {
  const fitnessLevels = ['beginner', 'intermediate', 'advanced'];
  const fitnessGoalsOptions = [
    'weight loss', 'muscle gain', 'endurance', 'flexibility', 
    'strength', 'general fitness', 'rehabilitation'
  ];
  const genders = ['male', 'female', 'other'];
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Generate a random name
  const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'David', 'Sophia', 'James', 'Olivia', 'Robert', 'Ava'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  
  // Generate a random email
  const email = `${name.toLowerCase().replace(' ', '.')}${index}@example.com`;
  
  // Base user data
  const user: UserData = {
    name,
    email,
    emailVerified: new Date(),
    image: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
    roles: [role],
    provider: Math.random() > 0.5 ? 'google' : 'credentials',
    password: role === 'admin' ? bcrypt.hashSync('admin123', 10) : bcrypt.hashSync('password123', 10),
    height: Math.floor(Math.random() * 50) + 150, // 150-200 cm
    weight: Math.floor(Math.random() * 75) + 45, // 45-120 kg
    birthdate: new Date(Date.now() - Math.floor(Math.random() * 1500000000000)), // Random date in the past
    gender: genders[Math.floor(Math.random() * genders.length)],
    fitnessLevel: fitnessLevels[Math.floor(Math.random() * fitnessLevels.length)],
    fitnessGoals: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      fitnessGoalsOptions[Math.floor(Math.random() * fitnessGoalsOptions.length)]
    ),
    preferredWorkoutDays: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
      weekdays[Math.floor(Math.random() * weekdays.length)]
    ),
    lastLogin: new Date()
  };
  
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admins to seed the database
    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get the count parameter from the URL
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : 10;
    
    // Limit the count to a reasonable number
    const actualCount = Math.min(count, 50);
    
    // Create users
    const createdUsers = [];
    
    // Create 1 admin if none exists
    const existingAdmin = await (User.findOne as any)({ roles: 'admin' });
    if (!existingAdmin) {
      const adminUser = {
        name: 'Admin User',
        email: 'admin@mamuk.com',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        roles: ['admin'],
        provider: 'credentials',
        password: await bcrypt.hash('admin123', 10),
        lastLogin: new Date()
      };
      
      await (User.create as any)(adminUser);
      createdUsers.push({ name: adminUser.name, email: adminUser.email, roles: adminUser.roles });
    }
    
    // Create coaches (20% of users)
    const coachCount = Math.max(1, Math.floor(actualCount * 0.2));
    const coaches = [];
    
    for (let i = 0; i < coachCount; i++) {
      const coach = generateRandomUser('coach', i);
      try {
        const savedCoach = await (User.create as any)(coach);
        coaches.push(savedCoach);
        createdUsers.push({ name: coach.name, email: coach.email, roles: coach.roles });
      } catch (error) {
        console.error(`Error creating coach: ${error}`);
      }
    }
    
    // Create customers (remaining users)
    const customerCount = actualCount - coachCount;
    
    for (let i = 0; i < customerCount; i++) {
      const customer = generateRandomUser('customer', i + coachCount);
      
      // Assign a coach to some customers
      if (Math.random() > 0.4 && coaches.length > 0) {
        const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];
        customer.coach = randomCoach._id;
      }
      
      try {
        await (User.create as any)(customer);
        createdUsers.push({ name: customer.name, email: customer.email, roles: customer.roles });
      } catch (error) {
        console.error(`Error creating customer: ${error}`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdUsers.length} users`,
      users: createdUsers
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
} 
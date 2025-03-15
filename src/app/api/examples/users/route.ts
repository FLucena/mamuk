import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest, sanitizeHtml } from '@/app/_lib/validation';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Define the user schema for validation
const UserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio is too long').optional(),
  age: z.number().int().positive().optional(),
  website: z.string().url('Invalid URL').optional(),
  role: z.enum(['user', 'admin', 'editor'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

// Type inference from the schema
type User = z.infer<typeof UserSchema>;

// In-memory storage for demo purposes
const users: User[] = [];

/**
 * GET handler - Return all users
 */
export async function GET(req: NextRequest) {
  // Add cache control headers
  const headers = new Headers();
  headers.set('Cache-Control', 'private, max-age=10');
  
  return NextResponse.json(
    { success: true, data: users },
    { headers }
  );
}

/**
 * POST handler - Create a new user
 */
export async function POST(req: NextRequest) {
  // Validate request data against schema
  const result = await validateRequest(req, UserSchema);
  
  if (!result.success) {
    return result.response;
  }
  
  // Data is valid, sanitize any HTML content
  const userData = result.data;
  
  if (userData.bio) {
    userData.bio = sanitizeHtml(userData.bio);
  }
  
  // Check if email already exists
  const emailExists = users.some(user => user.email === userData.email);
  if (emailExists) {
    return NextResponse.json(
      {
        success: false,
        errors: { email: ['Email already in use'] },
        message: 'Email already exists',
      },
      { status: 409 }
    );
  }
  
  // Add user to the in-memory storage
  users.push(userData);
  
  // Return success response
  return NextResponse.json(
    {
      success: true,
      data: userData,
      message: 'User created successfully',
    },
    { status: 201 }
  );
}

/**
 * PUT handler - Update a user
 */
export async function PUT(req: NextRequest) {
  // Define update schema (all fields optional)
  const UpdateSchema = UserSchema.partial();
  
  // Validate request data
  const result = await validateRequest(req, UpdateSchema.extend({
    email: z.string().email('Invalid email address'),
  }));
  
  if (!result.success) {
    return result.response;
  }
  
  const updateData = result.data;
  
  // Find user by email
  const userIndex = users.findIndex(user => user.email === updateData.email);
  
  if (userIndex === -1) {
    return NextResponse.json(
      {
        success: false,
        message: 'User not found',
      },
      { status: 404 }
    );
  }
  
  // Sanitize any HTML content
  if (updateData.bio) {
    updateData.bio = sanitizeHtml(updateData.bio);
  }
  
  // Update user
  users[userIndex] = { ...users[userIndex], ...updateData };
  
  // Return success response
  return NextResponse.json({
    success: true,
    data: users[userIndex],
    message: 'User updated successfully',
  });
}

/**
 * DELETE handler - Delete a user
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get email from URL
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email parameter is required',
        },
        { status: 400 }
      );
    }
    
    // Find user index
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }
    
    // Remove user
    users.splice(userIndex, 1);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while deleting the user',
      },
      { status: 500 }
    );
  }
} 
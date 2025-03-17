import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';

// Define the request structure
interface AccessRequest {
  userId: string;
  userName: string;
  userEmail: string;
  currentRoles: string[];
  requestedAccess: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request
    if (!body.reason || !body.requestedAccess) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await dbConnect();
    
    // In a real implementation, you would save this to your database
    // For now, we'll just log it and return a success response
    const accessRequest: AccessRequest = {
      userId: session.user.id,
      userName: session.user.name || 'Unknown',
      userEmail: session.user.email || 'Unknown',
      currentRoles: session.user.roles || [],
      requestedAccess: body.requestedAccess,
      reason: body.reason,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Access request received:', accessRequest);
    
    // In a real implementation, you would save this to your database
    // const savedRequest = await AccessRequestModel.create(accessRequest);
    
    // You might also want to send an email notification to administrators
    
    return NextResponse.json(
      { 
        message: 'Access request submitted successfully',
        requestId: 'temp-' + Date.now() // In a real implementation, this would be the ID from the database
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing access request:', error);
    
    return NextResponse.json(
      { error: 'Failed to process access request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the session to verify the user is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    if (!session.user.roles.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // In a real implementation, you would fetch access requests from your database
    // For now, we'll just return a mock response
    return NextResponse.json(
      { 
        requests: [
          {
            id: 'mock-1',
            userId: 'user-123',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            currentRoles: ['customer'],
            requestedAccess: '/admin',
            reason: 'I need to manage user accounts',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching access requests:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch access requests' },
      { status: 500 }
    );
  }
} 
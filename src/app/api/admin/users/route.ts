import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Role } from '@/lib/types/user';
import { Types } from 'mongoose';

interface DbUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: Role;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    // Get role filter from query params
    const searchParams = req.nextUrl.searchParams;
    const roleFilter = searchParams.get('role') as Role | null;

    await dbConnect();

    // Build query based on filters
    const query: { role?: Role } = {};
    if (roleFilter) {
      query.role = roleFilter;
    }

    // Fetch users with optional role filter
    const users = await User.find(query).lean<DbUser[]>();

    // Transform MongoDB _id to string
    const transformedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
} 
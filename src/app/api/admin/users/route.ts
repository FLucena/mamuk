import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Types } from 'mongoose';

interface DbUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: string;
}

export async function GET() {
  try {
    console.log('Admin users API - Starting GET request');
    const session = await getServerSession(authOptions);
    
    console.log('Admin users API - Session:', JSON.stringify({
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    }));

    // Comprobar si el usuario está autenticado
    if (!session?.user) {
      console.log('Admin users API - No session found');
      return new NextResponse(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401 }
      );
    }

    // Comprobar si el usuario tiene el rol de administrador
    if (session.user.role !== 'admin') {
      console.log('Admin users API - User is not admin:', session.user.role);
      return new NextResponse(
        JSON.stringify({ error: 'Permisos insuficientes. Se requiere rol de administrador.' }),
        { status: 403 }
      );
    }

    console.log('Admin users API - Connecting to database');
    await dbConnect();
    
    console.log('Admin users API - Fetching users from database');
    const users = await User.find()
      .select('name email image role')
      .lean<DbUser[]>();

    console.log(`Admin users API - Found ${users.length} users`);

    // Transform _id to id for consistency
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role
    }));

    console.log('Admin users API - Returning user data successfully');
    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error in users API route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Types } from 'mongoose';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


interface DbUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: string;
  roles?: string[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Comprobar si el usuario está autenticado
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401 }
      );
    }

    // Comprobar si el usuario tiene el rol de administrador
    if (!session.user.roles?.includes('admin')) {
      return new NextResponse(
        JSON.stringify({ error: 'Permisos insuficientes. Se requiere rol de administrador.' }),
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Get query parameters
    const url = new URL(request.url);
    const roleFilter = url.searchParams.get('role');
    
    // Build query
    const query: any = {};
    if (roleFilter) {
      query.roles = roleFilter;
    }
    
    const users = await User.find(query)
      .select('name email image roles')
      .lean<DbUser[]>();

    // Transform _id to id for consistency
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      roles: user.roles || []
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
} 
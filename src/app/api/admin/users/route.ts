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
    const session = await getServerSession(authOptions);

    // Comprobar si el usuario está autenticado
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401 }
      );
    }

    // Comprobar si el usuario tiene el rol de administrador
    if (session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Permisos insuficientes. Se requiere rol de administrador.' }),
        { status: 403 }
      );
    }

    await dbConnect();
    
    const users = await User.find()
      .select('name email image role')
      .lean<DbUser[]>();

    // Transform _id to id for consistency
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/lib/models/user';
import { dbConnect } from '@/lib/db';
import { validateMongoId } from '@/lib/utils/security';
import { Types } from 'mongoose';
import { UserRole } from '@/lib/models/user';
import { sortRoles } from '@/lib/utils/roles';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  roles?: UserRole[];
  __v: number;
}

// Define role hierarchy (higher index = higher priority)
const ROLE_HIERARCHY = ['customer', 'coach', 'admin'];

// Function to get the highest priority role from an array of roles
const getHighestPriorityRole = (roles: UserRole[]): UserRole => {
  // Filter roles to only include those in our hierarchy
  const validRoles = roles.filter(r => ROLE_HIERARCHY.includes(r));
  
  if (validRoles.length === 0) return 'customer'; // Default to customer if no valid roles
  
  // Sort roles by their position in the hierarchy (highest last)
  const sortedRoles = [...validRoles].sort(
    (a, b) => ROLE_HIERARCHY.indexOf(a) - ROLE_HIERARCHY.indexOf(b)
  );
  
  // Return the highest priority role (last in sorted array)
  return sortedRoles[sortedRoles.length - 1] as UserRole;
};

export async function GET(
  request: NextRequest, 
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { userId } = params;

    if (!validateMongoId(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId)
      .select('name email image roles')
      .lean() as UserDocument;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Transformar los datos para la respuesta
    const transformedUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      roles: sortRoles(user.roles || ['customer'])
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { userId } = params;

    if (!validateMongoId(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, roles } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Ensure roles is an array and contains at least one role
    const userRoles = Array.isArray(roles) && roles.length > 0 
      ? sortRoles(roles) 
      : ['customer'];

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        name, 
        email, 
        roles: userRoles
      },
      { new: true }
    ).select('name email image roles').lean() as UserDocument;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Transformar los datos para la respuesta
    const transformedUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      roles: sortRoles(user.roles || ['customer'])
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { userId } = params;

    if (!validateMongoId(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario no es el admin actual
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    await dbConnect();
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en la ruta /api/admin/users/[userId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { validateMongoId } from '@/lib/utils/security';
import { Role } from '@/lib/types/user';

interface RouteParams {
  params: {
    userId: string;
  };
}

interface UserResponse {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role: Role;
  roles: Role[];
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar que el usuario está autenticado y es administrador
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar el ID del usuario
    if (!validateMongoId(params.userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Obtener los roles del cuerpo de la solicitud
    const body = await request.json();
    const { roles } = body;

    // Validar que roles es un array y contiene roles válidos
    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un rol' },
        { status: 400 }
      );
    }

    // Validar que todos los roles son válidos
    const validRoles: Role[] = ['admin', 'coach', 'customer'];
    const allRolesValid = roles.every(role => validRoles.includes(role as Role));
    
    if (!allRolesValid) {
      return NextResponse.json(
        { error: 'Roles inválidos' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Actualizar los roles del usuario
    const updatedUser: any = await User.findByIdAndUpdate(
      params.userId,
      { 
        roles,
        role: roles[0] // El primer rol es el principal
      },
      { new: true }
    ).select('name email image role roles').lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Transformar _id a id para mantener consistencia
    const transformedUser: UserResponse = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
      roles: updatedUser.roles
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error en la ruta /api/admin/users/[userId]/roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
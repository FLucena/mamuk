import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/lib/models/user';
import { dbConnect } from '@/lib/db';
import { validateMongoId } from '@/lib/utils/security';
import { Types } from 'mongoose';
import { UserRole } from '@/lib/models/user';

interface RouteParams {
  params: {
    userId: string;
  };
}

interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  roles: UserRole[];
  __v: number;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!validateMongoId(params.userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(params.userId)
      .select('name email image role roles')
      .lean() as UserDocument;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Transformar _id a id para mantener consistencia
    const transformedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      roles: user.roles || [user.role]
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error en la ruta /api/admin/users/[userId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!validateMongoId(params.userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Actualizar el usuario, asegurándose de que el rol principal esté en el array de roles
    const updateData = {
      name, 
      email, 
      role,
      // Si no hay roles o el rol principal no está en el array, añadirlo
      $addToSet: { roles: role }
    };

    const user: any = await User.findByIdAndUpdate(
      params.userId,
      updateData,
      { new: true }
    ).select('name email image role roles').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Transformar _id a id para mantener consistencia
    const transformedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      roles: user.roles || [user.role]
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error en la ruta /api/admin/users/[userId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!validateMongoId(params.userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario no es el admin actual
    if (params.userId === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    await dbConnect();
    await User.findByIdAndDelete(params.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en la ruta /api/admin/users/[userId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
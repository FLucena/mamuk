import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/lib/models/user';
import { dbConnect } from '@/lib/db';
import { hasRole } from '@/lib/utils/permissions';
import { sortRoles } from '@/lib/utils/roles';

// Removed mock for production build

export async function GET(request, { params }) {
  await dbConnect();
  
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // Check admin permission
  if (!hasRole(session.user, 'admin')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  try {
    const { userId } = params;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ roles: sortRoles(user.roles || []) });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // Check admin permission
  if (!hasRole(session.user, 'admin')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  try {
    const { userId } = params;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }
    
    const { roles } = await request.json();
    
    // Validate roles
    if (!Array.isArray(roles)) {
      return NextResponse.json({ error: 'Se requiere al menos un rol' }, { status: 400 });
    }
    
    if (roles.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un rol' }, { status: 400 });
    }
    
    // Validate role values
    const validRoles = ['admin', 'coach', 'customer'];
    const hasInvalidRole = roles.some(role => !validRoles.includes(role));
    if (hasInvalidRole) {
      return NextResponse.json({ error: 'Roles inválidos' }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    // Check if admin is trying to remove their own admin role
    if (session.user.id === userId && 
        user.roles.includes('admin') && 
        !roles.includes('admin')) {
      return NextResponse.json(
        { error: 'No se puede remover el rol de administrador de sí mismo' }, 
        { status: 403 }
      );
    }
    
    // Sort roles before updating
    const sortedRoles = sortRoles(roles);
    
    // Update user roles
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { roles: sortedRoles },
      { new: true }
    );
    
    return NextResponse.json({ roles: sortRoles(updatedUser.roles || []) });
  } catch (error) {
    console.error('Error updating user roles:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Helper function to determine the highest priority role
function getHighestPriorityRole(roles) {
  const priorityOrder = {
    'admin': 1,
    'coach': 2,
    'customer': 3
  };
  
  // Sort roles by priority and return the highest priority (lowest number)
  return roles.sort((a, b) => priorityOrder[a] - priorityOrder[b])[0];
} 
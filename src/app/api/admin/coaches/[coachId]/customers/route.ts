import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Coach from '@/lib/models/coach';
import { Types } from 'mongoose';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { coachId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Check if user is admin
    if (!session.user.roles.includes('admin')) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }
    
    const { coachId } = params;
    
    if (!coachId) {
      return NextResponse.json({ error: 'ID de coach no proporcionado' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Buscar el coach por su _id
    const coach = await (Coach.findById as any)(coachId);
    
    if (!coach) {
      // Si el coach no existe, devolver una lista vacía
      return NextResponse.json({ customers: [] });
    }
    
    // Devolver la lista de IDs de clientes asignados
    const customerIds = coach.customers.map((id: Types.ObjectId) => id.toString());
    
    return NextResponse.json({ 
      customers: customerIds
    });
  } catch (error) {
    console.error('Error obteniendo clientes asignados:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Coach from '@/lib/models/coach';
import User from '@/lib/models/user';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    const { coachId, customerIds } = body;
    
    if (!coachId || !customerIds || !Array.isArray(customerIds)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Verify coach exists
    const coach = await Coach.findById(coachId);
    if (!coach) {
      return NextResponse.json({ error: 'Coach no encontrado' }, { status: 404 });
    }
    
    // Verify all customers exist and have role 'customer'
    const customerObjectIds = customerIds.map(id => new Types.ObjectId(id));
    const customers = await User.find({
      _id: { $in: customerObjectIds },
      role: 'customer'
    });
    
    if (customers.length !== customerIds.length) {
      return NextResponse.json({ 
        error: 'Uno o más clientes no existen o no tienen el rol de cliente' 
      }, { status: 400 });
    }
    
    // Update coach's customers list
    coach.customers = customerObjectIds;
    await coach.save();
    
    return NextResponse.json({ 
      success: true,
      message: 'Clientes asignados correctamente',
      assignedCount: customerIds.length
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 
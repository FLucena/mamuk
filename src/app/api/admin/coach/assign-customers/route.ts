import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Coach from '@/lib/models/coach';
import User from '@/lib/models/user';
import { Types } from 'mongoose';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
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
    
    // Parse request body
    const body = await request.json();
    const { coachId, customerIds } = body;
    
    if (!coachId || !customerIds || !Array.isArray(customerIds)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Verify coach exists - find by userId instead of _id
    const coach = await Coach.findOne({ userId: new Types.ObjectId(coachId) });
    
    if (!coach) {
      // If coach doesn't exist, create a new coach record
      const coachUser = await User.findById(coachId);
      if (!coachUser) {
        return NextResponse.json({ error: 'Usuario coach no encontrado' }, { status: 404 });
      }
      
      if (!coachUser.roles.includes('coach') && !coachUser.roles.includes('admin')) {
        return NextResponse.json({ error: 'El usuario no es un coach' }, { status: 400 });
      }
      
      const newCoach = new Coach({
        userId: coachId,
        customers: customerIds.map(id => new Types.ObjectId(id))
      });
      
      await newCoach.save();
      
      return NextResponse.json({ 
        success: true,
        message: 'Coach creado y clientes asignados correctamente',
        assignedCount: customerIds.length
      });
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
    console.error('Error assigning customers:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 
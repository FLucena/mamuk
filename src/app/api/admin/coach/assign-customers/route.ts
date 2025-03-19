import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Coach from '@/lib/models/coach';
import User from '@/lib/models/user';
import mongoose from 'mongoose';

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
    
    const coachObjectId = new mongoose.Types.ObjectId(coachId);

    let coach = await (Coach.findOne as any)({ userId: coachObjectId });
    
    if (!coach) {
      // If coach doesn't exist, create a new coach record
      const coachUser = await (User.findById as any)(coachObjectId);
      if (!coachUser) {
        return NextResponse.json({ error: 'Usuario coach no encontrado' }, { status: 404 });
      }
      
      if (!coachUser.roles.includes('coach') && !coachUser.roles.includes('admin')) {
        return NextResponse.json({ error: 'El usuario no es un coach' }, { status: 400 });
      }
      
      // Create coach record
      const newCoach = await (Coach.create as any)({
        userId: coachId,
        specialties: [],
        biography: ''
      });
      
      await newCoach.save();
    }
    
    // Process each customer ID
    for (const customerId of customerIds) {
      // Verify customer exists
      const customer = await (User.findById as any)(customerId);
      
      if (!customer) {
        continue; // Skip this customer
      }
      
      // Add customer role if they don't have it
      if (!customer.roles.includes('customer')) {
        customer.roles.push('customer');
        await customer.save();
      }
    }
    
    // Update coach customers list
    const updateResult = await (Coach.updateOne as any)(
      { userId: coachId },
      { $addToSet: { customers: { $each: customerIds } } }
    );
    
    // Update customer's coach list
    await (User.updateMany as any)(
      { _id: { $in: customerIds.map(id => new mongoose.Types.ObjectId(id)) } },
      { $addToSet: { assignedCoaches: coachId } }
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Clientes asignados correctamente',
      assignedCount: customerIds.length,
      totalAssigned: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error assigning customers:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Coach from '@/lib/models/coach';
import User from '@/lib/models/user';
import { validateMongoId } from '@/lib/utils/security';
import { ensureCoachExists } from '@/lib/services/coach';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { coachId, customerIds } = await req.json();

    // Validate inputs
    if (!coachId || !Array.isArray(customerIds)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Validate MongoDB IDs
    if (!validateMongoId(coachId)) {
      return NextResponse.json(
        { error: 'ID de coach inválido' },
        { status: 400 }
      );
    }

    for (const customerId of customerIds) {
      if (!validateMongoId(customerId)) {
        return NextResponse.json(
          { error: `ID de cliente inválido: ${customerId}` },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    // Check if coach exists, if not try to create it
    let coach = await Coach.findById(coachId);
    
    if (!coach) {
      try {
        // Try to create coach document
        const coachDoc = await ensureCoachExists(coachId);
        if (!coachDoc) {
          return NextResponse.json(
            { error: 'No se pudo crear el coach' },
            { status: 500 }
          );
        }
        coach = await Coach.findById(coachId);
        
        if (!coach) {
          return NextResponse.json(
            { error: 'Error al obtener el coach recién creado' },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error('Error creating coach:', error);
        return NextResponse.json(
          { error: 'Error al crear el coach' },
          { status: 500 }
        );
      }
    }

    // Check if all customers exist and have the customer role
    const customers = await User.find({
      _id: { $in: customerIds },
      role: 'customer'
    });

    if (customers.length !== customerIds.length) {
      return NextResponse.json(
        { error: 'Uno o más clientes no existen o no tienen el rol de cliente' },
        { status: 400 }
      );
    }

    // Update coach's customers
    coach.customers = customerIds;
    await coach.save();

    return NextResponse.json(
      { message: 'Clientes asignados correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assigning customers to coach:', error);
    return NextResponse.json(
      { error: 'Error al asignar clientes al coach' },
      { status: 500 }
    );
  }
} 
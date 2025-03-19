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
    console.log('API: /api/admin/coach/assign-customers - Request received');
    
    // Get session first
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('Session obtained:', session ? 'valid' : 'null');
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json({ 
        error: 'Error obteniendo la sesión',
        details: sessionError instanceof Error ? sessionError.message : 'Error desconocido'
      }, { status: 500 });
    }
    
    // Check if user is authenticated
    if (!session?.user) {
      console.log('API: User not authenticated');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Check if user is admin
    if (!session.user.roles || !session.user.roles.includes('admin')) {
      console.log('API: User not admin', { roles: session.user.roles });
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      // Log detailed info about the request body
      console.log('Request body parsed:', JSON.stringify(body));
      console.log('coachId type:', typeof body.coachId);
      console.log('coachId value:', body.coachId);
      console.log('customerIds type:', Array.isArray(body.customerIds) ? 'array' : typeof body.customerIds);
      console.log('customerIds length:', Array.isArray(body.customerIds) ? body.customerIds.length : 'N/A');
      console.log('mode:', body.mode);
    } catch (bodyError) {
      console.error('Error parsing request body:', bodyError);
      return NextResponse.json({ 
        error: 'Error al procesar el cuerpo de la solicitud',
        details: bodyError instanceof Error ? bodyError.message : 'Error desconocido'
      }, { status: 400 });
    }
    
    const { coachId, customerIds, mode = 'add' } = body;
    
    if (!coachId || !customerIds || !Array.isArray(customerIds)) {
      console.log('API: Invalid data', { coachId, customerIds, mode });
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    
    // Validate mode parameter
    if (mode !== 'add' && mode !== 'replace') {
      console.log('API: Invalid mode', { mode });
      return NextResponse.json({ error: 'Modo inválido. Debe ser "add" o "replace"' }, { status: 400 });
    }
    
    // Connect to database
    try {
      await dbConnect();
      console.log('Database connected');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Error de conexión a la base de datos',
        details: dbError instanceof Error ? dbError.message : 'Error desconocido'
      }, { status: 500 });
    }
    
    try {
      const coachObjectId = new mongoose.Types.ObjectId(coachId);
      console.log('Created coach ObjectId:', coachObjectId);
    } catch (idError) {
      console.error('Invalid coach ID format:', idError);
      return NextResponse.json({ 
        error: 'ID de coach con formato inválido',
        details: idError instanceof Error ? idError.message : 'Error desconocido'
      }, { status: 400 });
    }

    // First check if the user exists (before we try to find the coach record)
    let coachUser;
    try {
      coachUser = await (User.findById as any)(coachId);
      if (!coachUser) {
        console.error('Coach user not found with ID:', coachId);
        return NextResponse.json({ error: 'Usuario coach no encontrado' }, { status: 404 });
      }
      console.log('Coach user found:', coachUser.name || coachUser.email || coachId);
    } catch (findUserError) {
      console.error('Error finding coach user:', findUserError);
      return NextResponse.json({
        error: 'Error buscando el usuario coach',
        details: findUserError instanceof Error ? findUserError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // Find coach
    let coach;
    try {
      const coachObjectId = new mongoose.Types.ObjectId(coachId);
      coach = await (Coach.findOne as any)({ userId: coachObjectId });
      console.log('Coach found:', coach ? 'yes' : 'no');
    } catch (findError) {
      console.error('Error finding coach:', findError);
      return NextResponse.json({ 
        error: 'Error buscando el coach',
        details: findError instanceof Error ? findError.message : 'Error desconocido'
      }, { status: 500 });
    }
    
    // Create coach if it doesn't exist
    if (!coach) {
      try {
        // Ensure user has coach role
        if (!coachUser.roles?.includes('coach') && !coachUser.roles?.includes('admin')) {
          // Add coach role if missing
          coachUser.roles = [...(coachUser.roles || []), 'coach'];
          await coachUser.save();
          console.log('Added coach role to user:', coachId);
        }
        
        // Create coach record
        console.log('Creating new coach record for user:', coachId);
        coach = await (Coach.create as any)({
          userId: coachId,
          specialties: [],
          biography: ''
        });
        
        console.log('New coach created:', coach._id);
      } catch (createError) {
        console.error('Error creating coach:', createError);
        return NextResponse.json({ 
          error: 'Error creando el coach',
          details: createError instanceof Error ? createError.message : 'Error desconocido'
        }, { status: 500 });
      }
    }
    
    // Process each customer ID - Using try/catch for individual operations
    const processedCustomers = [];
    try {
      for (const customerId of customerIds) {
        try {
          // Verify customer exists
          const customer = await (User.findById as any)(customerId);
          
          if (!customer) {
            console.log(`Customer not found: ${customerId}`);
            continue; // Skip this customer
          }
          
          // Add customer role if they don't have it
          if (!customer.roles?.includes('customer')) {
            customer.roles = [...(customer.roles || []), 'customer'];
            await customer.save();
            console.log(`Added customer role to user: ${customerId}`);
          }
          
          processedCustomers.push(customerId);
        } catch (customerError) {
          console.error(`Error processing customer ${customerId}:`, customerError);
          // Continue with other customers instead of failing completely
        }
      }
    } catch (customersError) {
      console.error('Error processing customers:', customersError);
      return NextResponse.json({ 
        error: 'Error procesando clientes',
        details: customersError instanceof Error ? customersError.message : 'Error desconocido'
      }, { status: 500 });
    }
    
    // Update coach customers list
    let updateResult;
    try {
      if (mode === 'add') {
        updateResult = await (Coach.updateOne as any)(
          { userId: coachId },
          { $addToSet: { customers: { $each: processedCustomers } } }
        );
      } else if (mode === 'replace') {
        updateResult = await (Coach.updateOne as any)(
          { userId: coachId },
          { $set: { customers: processedCustomers } }
        );
      }
      console.log('Coach customers updated:', updateResult);
    } catch (updateError) {
      console.error('Error updating coach customers:', updateError);
      return NextResponse.json({ 
        error: 'Error actualizando clientes del coach',
        details: updateError instanceof Error ? updateError.message : 'Error desconocido'
      }, { status: 500 });
    }
    
    // Update customer's coach list
    try {
      if (processedCustomers.length > 0) {
        if (mode === 'add') {
          // Add coach to selected customers
          const customerObjectIds = processedCustomers.map(id => new mongoose.Types.ObjectId(id));
          await (User.updateMany as any)(
            { _id: { $in: customerObjectIds } },
            { $addToSet: { assignedCoaches: coachId } }
          );
          console.log('Customer coach lists updated (add mode)');
        } else if (mode === 'replace') {
          // First, remove coach from all customers who have this coach
          await (User.updateMany as any)(
            { assignedCoaches: coachId },
            { $pull: { assignedCoaches: coachId } }
          );
          console.log('Removed coach from previously assigned customers');
          
          // Then add coach to only the selected customers
          if (processedCustomers.length > 0) {
            const customerObjectIds = processedCustomers.map(id => new mongoose.Types.ObjectId(id));
            await (User.updateMany as any)(
              { _id: { $in: customerObjectIds } },
              { $addToSet: { assignedCoaches: coachId } }
            );
            console.log('Added coach to newly selected customers');
          }
        }
      }
    } catch (customerUpdateError) {
      console.error('Error updating customers\' coach list:', customerUpdateError);
      // This is not critical, so we don't return an error
    }
    
    console.log('API: Assignment completed successfully');
    return NextResponse.json({ 
      success: true,
      message: mode === 'replace' ? 'Asignaciones actualizadas correctamente' : 'Clientes asignados correctamente',
      mode,
      assignedCount: processedCustomers.length,
      processedCustomers,
      operationType: mode === 'replace' ? 'replace' : 'add',
      totalAssigned: updateResult?.modifiedCount || 0
    });
  } catch (error) {
    console.error('Unhandled error in assign-customers API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 
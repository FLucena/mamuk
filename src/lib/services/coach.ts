import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import Coach from '@/lib/models/coach';
import User from '@/lib/models/user';
import { validateMongoId } from '@/lib/utils/security';

// Definir interfaces para los tipos de respuesta
interface CustomerUser {
  _id: string;
  name?: string;
  email: string;
  image?: string;
}

interface CoachUser {
  _id: string;
  name?: string;
  email: string;
  image?: string;
}

export interface CoachDocument {
  _id: string;
  userId: CoachUser | string;
  specialties?: string[];
  bio?: string;
  customers: CustomerUser[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Obtiene un coach por su userId
 * @param userId ID del usuario asociado al coach
 * @returns Objeto coach con sus datos y clientes, o null si no existe
 */
export async function getCoachByUserId(userId: string): Promise<CoachDocument | null> {
  try {
    console.log('\n=== Starting getCoachByUserId ===');
    console.log('Searching for coach with userId:', userId);

    if (!validateMongoId(userId)) {
      console.log('❌ Invalid MongoDB ID:', userId);
      throw new Error('ID de usuario inválido');
    }

    await dbConnect();
    console.log('✅ Database connected');

    // First check if the user has the coach role
    const user = await (User.findById as any)(userId);
    console.log('User found:', {
      id: user?._id,
      email: user?.email,
      roles: user?.roles,
      exists: !!user
    });

    if (!user || !user.roles.includes('coach')) {
      console.log('❌ User not found or not a coach:', { userId, roles: user?.roles });
      return null;
    }

    // Try to find existing coach profile using ObjectId
    console.log('Looking for coach profile with userId:', new Types.ObjectId(userId));
    let coachDoc = await (Coach.findOne as any)({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name email image')
      .populate('customers', 'name email image')
      .lean();

    console.log('Coach profile search result:', {
      found: !!coachDoc,
      coachId: coachDoc?._id,
      customersCount: coachDoc?.customers?.length || 0
    });

    // If no coach profile exists but user has coach role, create one
    if (!coachDoc) {
      console.log('🔨 No coach profile found, creating one for user:', userId);
      const newCoach = await ensureCoachExists(userId);
      if (!newCoach) {
        console.log('❌ Failed to create coach profile for user:', userId);
        return null;
      }
      console.log('✅ Successfully created new coach profile:', {
        coachId: newCoach._id,
        customersCount: newCoach.customers?.length || 0
      });
      coachDoc = newCoach;
    }

    // Asegurarse de que coachDoc es un objeto y no un array
    if (Array.isArray(coachDoc)) {
      console.error('❌ Unexpected error: getCoachByUserId returned an array');
      return null;
    }

    // Convertir IDs a strings para consistencia
    const coach = {
      _id: coachDoc._id?.toString() || '',
      userId: typeof coachDoc.userId === 'object' && coachDoc.userId !== null 
        ? { 
            ...coachDoc.userId,
            _id: (coachDoc.userId as any)._id?.toString() || ''
          } 
        : (coachDoc.userId as any)?.toString() || '',
      specialties: coachDoc.specialties || [],
      bio: coachDoc.bio || '',
      customers: Array.isArray(coachDoc.customers) 
        ? coachDoc.customers.map((customer: any) => ({
            ...customer,
            _id: customer._id?.toString() || ''
          }))
        : [],
      createdAt: coachDoc.createdAt,
      updatedAt: coachDoc.updatedAt
    };

    console.log('✅ Successfully retrieved coach data:', {
      coachId: coach._id,
      userId: typeof coach.userId === 'object' ? coach.userId._id : coach.userId,
      customersCount: coach.customers.length,
      customers: coach.customers.map(c => ({ id: c._id, name: c.name }))
    });
    console.log('=== End getCoachByUserId ===\n');

    return coach;
  } catch (error) {
    console.error('❌ Error in getCoachByUserId:', error);
    return null;
  }
}

/**
 * Obtiene un coach por su ID de coach
 * @param coachId ID del coach
 * @returns Objeto coach con sus datos y clientes, o null si no existe
 */
export async function getCoachById(coachId: string): Promise<CoachDocument | null> {
  try {
    if (!validateMongoId(coachId)) {
      throw new Error('ID de coach inválido');
    }

    await dbConnect();
    const coachDoc = await (Coach.findById as any)(coachId)
      .populate('userId', 'name email image')
      .populate('customers', 'name email image')
      .lean();

    if (!coachDoc) {
      return null;
    }

    // Asegurarse de que coachDoc es un objeto y no un array
    if (Array.isArray(coachDoc)) {
      console.error('Error inesperado: getCoachById devolvió un array');
      return null;
    }

    // Convertir IDs a strings para consistencia
    const coach = {
      _id: coachDoc._id?.toString() || '',
      userId: typeof coachDoc.userId === 'object' && coachDoc.userId !== null 
        ? { 
            ...coachDoc.userId,
            _id: (coachDoc.userId as any)._id?.toString() || ''
          } 
        : (coachDoc.userId as any)?.toString() || '',
      specialties: coachDoc.specialties || [],
      bio: coachDoc.bio || '',
      customers: Array.isArray(coachDoc.customers) 
        ? coachDoc.customers.map((customer: any) => ({
            ...customer,
            _id: customer._id?.toString() || ''
          }))
        : [],
      createdAt: coachDoc.createdAt,
      updatedAt: coachDoc.updatedAt
    };

    return coach;
  } catch (error) {
    console.error('Error al obtener coach por ID:', error);
    return null;
  }
}

/**
 * Obtiene todos los coaches
 * @returns Array de coaches con sus datos y clientes
 */
export async function getAllCoaches(): Promise<CoachDocument[]> {
  try {
    await dbConnect();
    const coachDocs = await (Coach.find as any)()
      .populate('userId', 'name email image')
      .populate('customers', 'name email image')
      .lean();

    if (!coachDocs || !Array.isArray(coachDocs)) {
      return [];
    }

    // Mapear y convertir IDs a strings para consistencia
    const coaches = coachDocs.map(coachDoc => {
      return {
        _id: coachDoc._id?.toString() || '',
        userId: typeof coachDoc.userId === 'object' && coachDoc.userId !== null 
          ? { 
              ...coachDoc.userId,
              _id: (coachDoc.userId as any)._id?.toString() || ''
            } 
          : (coachDoc.userId as any)?.toString() || '',
        specialties: coachDoc.specialties || [],
        bio: coachDoc.bio || '',
        customers: Array.isArray(coachDoc.customers) 
          ? coachDoc.customers.map((customer: any) => ({
              ...customer,
              _id: customer._id?.toString() || ''
            }))
          : [],
        createdAt: coachDoc.createdAt,
        updatedAt: coachDoc.updatedAt
      };
    });

    return coaches;
  } catch (error) {
    console.error('Error al obtener todos los coaches:', error);
    return [];
  }
}

export async function createCoach({
  userId,
  specialties,
  biography,
}: {
  userId: string;
  specialties: string[];
  biography: string;
}) {
  if (!validateMongoId(userId)) {
    throw new Error('ID de usuario inválido');
  }

  await dbConnect();
  
  // Check if user exists and is not already a coach
  const existingUser = await (User.findById as any)(userId);
  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  const existingCoach = await (Coach.findOne as any)({ userId });
  if (existingCoach) {
    throw new Error('El usuario ya es un coach');
  }

  const coach = await (Coach.create as any)({
    userId,
    specialties,
    bio: biography,
  });

  return await coach.populate([
    { path: 'userId', select: 'name email image' },
    { path: 'customers', select: 'name email image' }
  ]);
}

export async function updateCoach({
  coachId,
  specialties,
  biography,
}: {
  coachId: string;
  specialties?: string[];
  biography?: string;
}) {
  if (!validateMongoId(coachId)) {
    throw new Error('ID de coach inválido');
  }

  await dbConnect();
  const coach = await (Coach.findByIdAndUpdate as any)(
    coachId,
    {
      $set: {
        ...(specialties && { specialties }),
        ...(biography && { bio: biography }),
      }
    },
    { new: true }
  )
  .populate('userId', 'name email image')
  .populate('customers', 'name email image');

  if (!coach) {
    throw new Error('Coach no encontrado');
  }

  return coach;
}

export async function deleteCoach(coachId: string) {
  if (!validateMongoId(coachId)) {
    throw new Error('ID de coach inválido');
  }

  await dbConnect();
  const coach = await (Coach.findByIdAndDelete as any)(coachId);
  
  if (!coach) {
    throw new Error('Coach no encontrado');
  }
}

export async function addCustomerToCoach({
  coachId,
  customerId,
}: {
  coachId: string;
  customerId: string;
}) {
  if (!validateMongoId(coachId) || !validateMongoId(customerId)) {
    throw new Error('IDs inválidos');
  }

  await dbConnect();
  
  // Check if customer exists
  const customer = await (User.findById as any)(customerId);
  if (!customer) {
    throw new Error('Cliente no encontrado');
  }

  const coach = await (Coach.findByIdAndUpdate as any)(
    coachId,
    {
      $addToSet: { customers: customerId }
    },
    { new: true }
  )
  .populate('userId', 'name email image')
  .populate('customers', 'name email image');

  if (!coach) {
    throw new Error('Coach no encontrado');
  }

  return coach;
}

export async function removeCustomerFromCoach({
  coachId,
  customerId,
}: {
  coachId: string;
  customerId: string;
}) {
  if (!validateMongoId(coachId) || !validateMongoId(customerId)) {
    throw new Error('IDs inválidos');
  }

  await dbConnect();
  const coach = await (Coach.findByIdAndUpdate as any)(
    coachId,
    {
      $pull: { customers: customerId }
    },
    { new: true }
  )
  .populate('userId', 'name email image')
  .populate('customers', 'name email image');

  if (!coach) {
    throw new Error('Coach no encontrado');
  }

  return coach;
}

export async function ensureCoachExists(userId: string): Promise<CoachDocument | null> {
  if (!validateMongoId(userId)) {
    throw new Error('ID de usuario inválido');
  }

  await dbConnect();
  
  // Check if user exists and has coach role
  const user = await (User.findById as any)(userId);
  if (!user) {
    console.log('User not found when ensuring coach exists:', userId);
    throw new Error('Usuario no encontrado');
  }

  if (!user.roles.includes('coach')) {
    console.log('User does not have coach role:', { userId, roles: user.roles });
    throw new Error('El usuario no tiene el rol de coach');
  }

  // Check if coach document already exists using ObjectId
  let coach = await (Coach.findOne as any)({ userId: new Types.ObjectId(userId) });
  
  // If coach doesn't exist, create it
  if (!coach) {
    console.log('Creating new coach profile for user:', userId);
    try {
      coach = await (Coach.create as any)({
        userId: new Types.ObjectId(userId),
        specialties: [],
        bio: '',
        customers: []
      });
      console.log('Successfully created coach profile:', coach._id);
    } catch (error) {
      console.error('Error creating coach profile:', error);
      throw error;
    }
  }

  return await coach.populate([
    { path: 'userId', select: 'name email image' },
    { path: 'customers', select: 'name email image' }
  ]);
} 
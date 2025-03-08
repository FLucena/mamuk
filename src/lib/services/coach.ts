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
    if (!validateMongoId(userId)) {
      throw new Error('ID de usuario inválido');
    }

    await dbConnect();
    const coachDoc = await Coach.findOne({ userId })
      .populate('userId', 'name email image')
      .populate('customers', 'name email image')
      .lean();

    if (!coachDoc) {
      // Check if the user has the coach role
      const user = await User.findById(userId);
      if (user && user.role === 'coach') {
        // Create a coach document if the user has the coach role
        return await ensureCoachExists(userId);
      }
      return null;
    }

    // Asegurarse de que coachDoc es un objeto y no un array
    if (Array.isArray(coachDoc)) {
      console.error('Error inesperado: getCoachByUserId devolvió un array');
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
    console.error('Error al obtener coach por userId:', error);
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
    const coachDoc = await Coach.findById(coachId)
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
    const coachDocs = await Coach.find()
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
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  const existingCoach = await Coach.findOne({ userId });
  if (existingCoach) {
    throw new Error('El usuario ya es un coach');
  }

  const coach = await Coach.create({
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
  const coach = await Coach.findByIdAndUpdate(
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
  const coach = await Coach.findByIdAndDelete(coachId);
  
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
  const customer = await User.findById(customerId);
  if (!customer) {
    throw new Error('Cliente no encontrado');
  }

  const coach = await Coach.findByIdAndUpdate(
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
  const coach = await Coach.findByIdAndUpdate(
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
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.role !== 'coach') {
    throw new Error('El usuario no tiene el rol de coach');
  }

  // Check if coach document already exists
  let coach = await Coach.findOne({ userId });
  
  // If coach doesn't exist, create it
  if (!coach) {
    coach = await Coach.create({
      userId,
      specialties: [],
      bio: '',
      customers: []
    });
  }

  return await coach.populate([
    { path: 'userId', select: 'name email image' },
    { path: 'customers', select: 'name email image' }
  ]);
} 
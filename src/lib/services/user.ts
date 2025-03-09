import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Types } from 'mongoose';
import { validateMongoId } from '@/lib/utils/security';
import { MongoUser } from '@/lib/types/user';

interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: string;
  active?: boolean;
  __v: number;
}

/**
 * Obtiene todos los usuarios activos
 */
export async function getActiveUsers() {
  try {
    console.log('[SERVICE] getActiveUsers - Conectando a la base de datos');
    await dbConnect();
    
    console.log('[SERVICE] getActiveUsers - Buscando usuarios activos');
    
    // Buscar usuarios que sean activos o que no tengan el campo active (asumiendo que son activos)
    const users = await User.find({
      $or: [
        { active: true },
        { active: { $exists: false } }
      ]
    })
      .select('name email image role')
      .lean() as UserDocument[];
    
    console.log('[SERVICE] getActiveUsers - Encontrados:', users.length, 'usuarios');

    // Transformar _id a id para mantener consistencia
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role
    }));
    
    return transformedUsers;
  } catch (error) {
    console.error('[SERVICE] getActiveUsers - Error:', error);
    // En caso de error, devolver un array vacío para evitar errores en cascada
    return [];
  }
}

/**
 * Obtiene un usuario por su ID
 */
export async function getUserById(userId: string) {
  if (!validateMongoId(userId)) {
    throw new Error('ID de usuario inválido');
  }

  await dbConnect();
  
  const user = await User.findOne({ _id: new Types.ObjectId(userId) })
    .select('name email image role')
    .lean() as UserDocument | null;

  if (!user) {
    return null;
  }

  // Transformar _id a id para mantener consistencia
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role
  };
}

/**
 * Obtiene todos los usuarios con rol de cliente
 */
export async function getCustomers() {
  try {
    console.log('[SERVICE] getCustomers - Conectando a la base de datos');
    await dbConnect();
    
    console.log('[SERVICE] getCustomers - Buscando usuarios con rol de cliente');
    
    // Buscar usuarios que sean activos y tengan rol de cliente
    const users = await User.find({
      $and: [
        { 
          $or: [
            { active: true },
            { active: { $exists: false } }
          ] 
        },
        { role: 'customer' }
      ]
    })
      .select('name email image role')
      .lean() as UserDocument[];
    
    console.log('[SERVICE] getCustomers - Encontrados:', users.length, 'clientes');

    // Transformar _id a id para mantener consistencia
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role
    }));
    
    return transformedUsers;
  } catch (error) {
    console.error('[SERVICE] getCustomers - Error:', error);
    // En caso de error, devolver un array vacío para evitar errores en cascada
    return [];
  }
}

/**
 * Get all users from the database
 * @returns Array of users with MongoDB format (_id)
 */
export async function getAllUsers(): Promise<MongoUser[]> {
  try {
    await dbConnect();
    const users = await User.find().lean();
    
    // Convert MongoDB ObjectIds to strings and ensure type safety
    return users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      image: user.image
    })) as MongoUser[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
} 
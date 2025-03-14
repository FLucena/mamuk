import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Types } from 'mongoose';
import { validateMongoId } from '@/lib/utils/security';

interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  roles: string[];
  active?: boolean;
  __v: number;
}

/**
 * Obtiene todos los usuarios activos
 */
export async function getActiveUsers() {
  try {
    // Removed console.log
    await dbConnect();
    
    // Removed console.log
    
    // Buscar usuarios que sean activos o que no tengan el campo active (asumiendo que son activos)
    const users = await User.find({
      $or: [
        { active: true },
        { active: { $exists: false } }
      ]
    })
      .select('name email image roles')
      .lean() as UserDocument[];
    
    // Removed console.log

    // Transformar _id a string para mantener consistencia
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      roles: user.roles || ['customer']
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
    .select('name email image roles')
    .lean() as UserDocument | null;

  if (!user) {
    return null;
  }

  // Transformar _id a string para mantener consistencia
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    roles: user.roles || ['customer']
  };
}

/**
 * Obtiene todos los usuarios con rol de cliente
 */
export async function getCustomers() {
  try {
    // Removed console.log
    await dbConnect();
    
    // Removed console.log
    
    // Buscar usuarios que sean activos y tengan rol de cliente
    const users = await User.find({
      $and: [
        { 
          $or: [
            { active: true },
            { active: { $exists: false } }
          ] 
        },
        { roles: 'customer' }
      ]
    })
      .select('name email image roles')
      .lean() as UserDocument[];
    
    // Removed console.log

    // Transformar _id a string para mantener consistencia
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      roles: user.roles || ['customer']
    }));
    
    return transformedUsers;
  } catch (error) {
    console.error('[SERVICE] getCustomers - Error:', error);
    // En caso de error, devolver un array vacío para evitar errores en cascada
    return [];
  }
} 
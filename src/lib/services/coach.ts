import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import Coach from '@/lib/models/coach';
import User from '@/lib/models/user';
import { validateMongoId } from '@/lib/utils/security';

export async function getCoachByUserId(userId: string) {
  if (!validateMongoId(userId)) {
    throw new Error('ID de usuario inválido');
  }

  await dbConnect();
  const coach = await Coach.findOne({ userId })
    .populate('userId', 'name email image')
    .populate('customers', 'name email image')
    .lean();

  return coach;
}

export async function getCoachById(coachId: string) {
  if (!validateMongoId(coachId)) {
    throw new Error('ID de coach inválido');
  }

  await dbConnect();
  const coach = await Coach.findById(coachId)
    .populate('userId', 'name email image')
    .populate('customers', 'name email image')
    .lean();

  return coach;
}

export async function getAllCoaches() {
  await dbConnect();
  const coaches = await Coach.find()
    .populate('userId', 'name email image')
    .populate('customers', 'name email image')
    .lean();

  return coaches;
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
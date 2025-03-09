import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User, { UserDocument } from '@/lib/models/user';
import { dbConnect } from '@/lib/db';
import { validateMongoId } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse(null, { status: 401 });

    const { searchParams } = new URL(request.url);
    const roles = searchParams.get('roles')?.split(',') || [];
    
    const query = roles.length > 0 ? { role: { $in: roles } } : {};
    const users = await User.find(query).lean<UserDocument[]>();

    const validatedUsers = users.map(user => {
      if (!user._id || !validateMongoId(user._id.toString())) {
        throw new Error('ID de usuario inválido');
      }
      return {
        id: user._id.toString(),
        name: user.name || '',
        email: user.email || '',
        role: user.role
      };
    });

    return NextResponse.json(validatedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 
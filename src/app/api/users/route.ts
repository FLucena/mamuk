import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User, { IUser } from '@/lib/models/user';
import { dbConnect } from '@/lib/db';
import { validateMongoId } from '@/lib/utils';

// Force dynamic rendering for this route since it depends on user session
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const roleFilter = searchParams.get('roles')?.split(',') || [];
    
    const query = roleFilter.length > 0 ? { roles: { $in: roleFilter } } : {};
    const users = await User.find(query).lean<IUser[]>();

    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      roles: user.roles || ['customer']
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
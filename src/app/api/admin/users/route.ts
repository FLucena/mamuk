import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/lib/models/user';
import { Types } from 'mongoose';
import { sortRoles } from '@/lib/utils/roles';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


interface DbUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: string;
  roles?: string[];
}

export async function GET(request: Request) {
  try {
    const startTime = performance.now();
    const session = await getServerSession(authOptions);

    // Comprobar si el usuario está autenticado
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401 }
      );
    }

    // Comprobar si el usuario tiene el rol de administrador
    if (!session.user.roles?.includes('admin')) {
      return new NextResponse(
        JSON.stringify({ error: 'Permisos insuficientes. Se requiere rol de administrador.' }),
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Get query parameters
    const url = new URL(request.url);
    const roleFilter = url.searchParams.get('role');
    const searchTerm = url.searchParams.get('search') || '';
    
    // Pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (roleFilter) {
      query.roles = roleFilter;
    }
    
    // Add search functionality
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination and only select needed fields
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('name email image roles')
        .skip(skip)
        .limit(limit)
        .lean<DbUser[]>(),
      User.countDocuments(query)
    ]);

    // Transformar los datos para la respuesta
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      roles: sortRoles(user.roles || ['customer'])
    }));

    // Calculate execution time
    const executionTime = performance.now() - startTime;
    console.log(`[PERFORMANCE] /api/admin/users execution time: ${executionTime.toFixed(2)}ms`);

    // Add pagination metadata
    const response = {
      users: transformedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };

    // Set cache headers for 1 minute (adjust as needed)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'X-Execution-Time': executionTime.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
} 
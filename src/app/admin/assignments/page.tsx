import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllUsers } from '@/lib/services/user';
import { getAllCoachesWithCustomers } from '@/lib/services/coach';
import CoachCustomerAssignmentClient from '@/components/admin/CoachCustomerAssignmentClient';

export default async function CoachCustomerAssignmentPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin?error=AccessDenied');
  }

  // Fetch all users and coaches with their customers
  const [users, coachesWithCustomers] = await Promise.all([
    getAllUsers(),
    getAllCoachesWithCustomers()
  ]);

  // Filter users by role
  const customers = users.filter(user => user.role === 'customer');
  const adminAndCoachUsers = users.filter(user => user.role === 'admin' || user.role === 'coach');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Asignaciones Coach-Cliente
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Asigna clientes a coaches para que puedan gestionar sus entrenamientos.
        </p>
      </div>
      
      <CoachCustomerAssignmentClient 
        coaches={coachesWithCustomers} 
        customers={customers}
        adminAndCoachUsers={adminAndCoachUsers}
      />
    </div>
  );
} 
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCoachByUserId } from '@/lib/services/coach';
import CustomerList from '@/components/coach/CustomerList';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Verificar que el usuario es coach
  if (session.user.role !== 'coach') {
    redirect('/');
  }

  const coach = await getCoachByUserId(session.user.id);
  if (!coach) {
    // Si el usuario es coach pero no tiene perfil de coach, redirigir
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Clientes</h1>
      <CustomerList coach={coach} />
    </div>
  );
} 